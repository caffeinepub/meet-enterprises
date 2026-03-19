import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Blob "mo:core/Blob";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Admin is verified by a secret code token instead of principal
  let ADMIN_CODE : Text = "2537";

  func isValidAdmin(token : Text) : Bool {
    token == ADMIN_CODE
  };

  public type UserProfile = {
    id : Principal;
    name : Text;
    whatsapp : Text;
  };

  public type Category = {
    id : Nat;
    name : Text;
  };

  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    mrp : Nat;
    discountAmount : Nat;
    categoryId : Nat;
    sizes : [Text];
    colours : [Text];
    image : Blob;
    imageType : Text;
    inStock : Bool;
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Nat;
  };

  public type Order = {
    id : Text;
    userId : Principal;
    items : [OrderItem];
    totalAmount : Nat;
    paymentMethod : Text;
    status : Text;
    createdAt : Int;
    deliveryLocation : Text;
  };

  public type Voucher = {
    id : Nat;
    userId : Principal;
    orderId : Text;
    code : Text;
    value : Nat;
    createdAt : Int;
  };

  public type Scheme = {
    id : Nat;
    title : Text;
    description : Text;
    couponCode : Text;
    createdAt : Int;
  };

  public type PaymentSettings = {
    upiId : Text;
    qrImage : Blob;
    qrImageType : Text;
  };

  func compareOrderByCreatedAt(o1 : Order, o2 : Order) : Order.Order {
    if (o1.createdAt > o2.createdAt) { #less } else if (o1.createdAt < o2.createdAt) {
      #greater;
    } else {
      Text.compare(o1.id, o2.id);
    };
  };

  func compareVoucherByCreatedAt(v1 : Voucher, v2 : Voucher) : Order.Order {
    if (v1.createdAt > v2.createdAt) { #less } else if (v1.createdAt < v2.createdAt) {
      #greater;
    } else {
      Text.compare(v1.code, v2.code);
    };
  };

  func compareSchemeByCreatedAt(s1 : Scheme, s2 : Scheme) : Order.Order {
    if (s1.createdAt > s2.createdAt) { #less } else if (s1.createdAt < s2.createdAt) {
      #greater;
    } else {
      Text.compare(s1.title, s2.title);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let categories = Map.empty<Nat, Category>();
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Text, Order>();
  let vouchers = Map.empty<Nat, Voucher>();
  let schemes = Map.empty<Nat, Scheme>();

  var nextCategoryId = 1;
  var nextProductId = 1;
  var nextVoucherId = 1;
  var nextSchemeId = 1;
  var paymentSettings : ?PaymentSettings = null;

  // ── Public read endpoints (no auth needed) ──────────────────────────────

  public query func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProductById(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query func getSchemes() : async [Scheme] {
    schemes.values().toArray().sort(compareSchemeByCreatedAt);
  };

  public query func getPaymentSettings() : async ?PaymentSettings {
    paymentSettings;
  };

  // ── User profile (caller-based, works for any principal) ────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(name : Text, whatsapp : Text) : async () {
    let userProfile : UserProfile = {
      id = caller;
      name;
      whatsapp;
    };
    userProfiles.add(caller, userProfile);
  };

  // ── Orders (caller-based) ───────────────────────────────────────────────

  public shared ({ caller }) func createOrder(items : [OrderItem], paymentMethod : Text, deliveryLocation : Text) : async Order {
    let totalAmount = items.foldLeft(0, func(acc, item) { acc + (item.price * item.quantity) });
    let orderId = "order-" # Time.now().toText();

    let order : Order = {
      id = orderId;
      userId = caller;
      items;
      totalAmount;
      paymentMethod;
      status = "Pending";
      createdAt = Time.now();
      deliveryLocation;
    };

    orders.add(orderId, order);

    if (totalAmount >= 1500) {
      let voucher : Voucher = {
        id = nextVoucherId;
        userId = caller;
        orderId;
        code = "VOUCHER-" # orderId;
        value = 100;
        createdAt = Time.now();
      };
      vouchers.add(nextVoucherId, voucher);
      nextVoucherId += 1;
    };

    order;
  };

  public query ({ caller }) func getUserOrders(userId : Principal) : async [Order] {
    let userOrders = List.empty<Order>();
    orders.forEach(
      func(_id, order) {
        if (order.userId == userId) {
          userOrders.add(order);
        };
      }
    );
    userOrders.toArray().sort(compareOrderByCreatedAt);
  };

  public query ({ caller }) func getUserVouchers(userId : Principal) : async [Voucher] {
    let userVouchers = List.empty<Voucher>();
    vouchers.forEach(
      func(_id, voucher) {
        if (voucher.userId == userId) {
          userVouchers.add(voucher);
        };
      }
    );
    userVouchers.toArray().sort(compareVoucherByCreatedAt);
  };

  public query ({ caller }) func getOrderById(orderId : Text) : async ?Order {
    orders.get(orderId);
  };

  // ── Admin endpoints (token-based auth) ─────────────────────────────────

  public shared func createCategory(adminToken : Text, name : Text) : async Category {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    let category : Category = { id = nextCategoryId; name };
    categories.add(nextCategoryId, category);
    nextCategoryId += 1;
    category;
  };

  public shared func updateCategory(adminToken : Text, id : Nat, name : Text) : async Category {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        let category : Category = { id; name };
        categories.add(id, category);
        category;
      };
    };
  };

  public shared func deleteCategory(adminToken : Text, id : Nat) : async () {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    if (not categories.containsKey(id)) {
      Runtime.trap("Category not found");
    };
    categories.remove(id);
  };

  public shared func createProduct(adminToken : Text, productInfo : {
    name : Text;
    description : Text;
    mrp : Nat;
    discountAmount : Nat;
    categoryId : Nat;
    sizes : [Text];
    colours : [Text];
    image : Blob;
    imageType : Text;
    inStock : Bool;
  }) : async Product {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    let product : Product = {
      id = nextProductId;
      name = productInfo.name;
      description = productInfo.description;
      mrp = productInfo.mrp;
      discountAmount = productInfo.discountAmount;
      categoryId = productInfo.categoryId;
      sizes = productInfo.sizes;
      colours = productInfo.colours;
      image = productInfo.image;
      imageType = productInfo.imageType;
      inStock = productInfo.inStock;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    product;
  };

  public shared func updateProduct(adminToken : Text, id : Nat, productInfo : {
    name : Text;
    description : Text;
    mrp : Nat;
    discountAmount : Nat;
    categoryId : Nat;
    sizes : [Text];
    colours : [Text];
    image : Blob;
    imageType : Text;
    inStock : Bool;
  }) : async Product {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let product : Product = {
          id;
          name = productInfo.name;
          description = productInfo.description;
          mrp = productInfo.mrp;
          discountAmount = productInfo.discountAmount;
          categoryId = productInfo.categoryId;
          sizes = productInfo.sizes;
          colours = productInfo.colours;
          image = productInfo.image;
          imageType = productInfo.imageType;
          inStock = productInfo.inStock;
        };
        products.add(id, product);
        product;
      };
    };
  };

  public shared func deleteProduct(adminToken : Text, id : Nat) : async () {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  public shared func updateOrderStatus(adminToken : Text, orderId : Text, status : Text) : async () {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = { order with status };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared func setPaymentSettings(adminToken : Text, upiId : Text, qrImage : Blob, qrImageType : Text) : async () {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    paymentSettings := ?{ upiId; qrImage; qrImageType };
  };

  public shared func getAllUsers(adminToken : Text) : async [UserProfile] {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    userProfiles.values().toArray();
  };

  public shared func getAllOrders(adminToken : Text) : async [Order] {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    orders.values().toArray().sort(compareOrderByCreatedAt);
  };

  public shared func getAllVouchers(adminToken : Text) : async [Voucher] {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    vouchers.values().toArray().sort(compareVoucherByCreatedAt);
  };

  public shared func createScheme(adminToken : Text, title : Text, description : Text, couponCode : Text) : async Scheme {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    let scheme : Scheme = {
      id = nextSchemeId;
      title;
      description;
      couponCode;
      createdAt = Time.now();
    };
    schemes.add(nextSchemeId, scheme);
    nextSchemeId += 1;
    scheme;
  };

  public shared func deleteScheme(adminToken : Text, id : Nat) : async () {
    if (not isValidAdmin(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin code");
    };
    if (not schemes.containsKey(id)) {
      Runtime.trap("Scheme not found");
    };
    schemes.remove(id);
  };
};
