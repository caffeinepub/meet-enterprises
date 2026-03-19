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

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(name : Text, whatsapp : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let userProfile : UserProfile = {
      id = caller;
      name;
      whatsapp;
    };
    userProfiles.add(caller, userProfile);
  };

  public shared ({ caller }) func createCategory(name : Text) : async Category {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create a category");
    };
    let category : Category = { id = nextCategoryId; name };
    categories.add(nextCategoryId, category);
    nextCategoryId += 1;
    category;
  };

  public shared ({ caller }) func updateCategory(id : Nat, name : Text) : async Category {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update a category");
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

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete category");
    };
    if (not categories.containsKey(id)) {
      Runtime.trap("Category not found");
    };
    categories.remove(id);
  };

  public shared ({ caller }) func createProduct(productInfo : {
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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create products");
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

  public shared ({ caller }) func updateProduct(id : Nat, productInfo : {
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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
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

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete product");
    };
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  public query ({ caller }) func getProductById(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public shared ({ caller }) func createOrder(items : [OrderItem], paymentMethod : Text, deliveryLocation : Text) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let totalAmount = items.foldLeft(0, func(acc, item) { acc + (item.price * item.quantity) });
    let orderId = "order-" # Time.now().toText();

    let order : Order = {
      id = orderId;
      userId = caller;
      items;
      totalAmount;
      paymentMethod;
      status = "pending";
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

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = { order with status };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func setPaymentSettings(upiId : Text, qrImage : Blob, qrImageType : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set payment settings");
    };
    paymentSettings := ?{ upiId; qrImage; qrImageType };
  };

  public query ({ caller }) func getOrderById(orderId : Text) : async ?Order {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getUserOrders(userId : Principal) : async [Order] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
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
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own vouchers");
    };
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

  public query ({ caller }) func getPaymentSettings() : async ?PaymentSettings {
    paymentSettings;
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.values().toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray().sort(compareOrderByCreatedAt);
  };

  public query ({ caller }) func getAllVouchers() : async [Voucher] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all vouchers");
    };
    vouchers.values().toArray().sort(compareVoucherByCreatedAt);
  };

  public query ({ caller }) func getSchemes() : async [Scheme] {
    schemes.values().toArray().sort(compareSchemeByCreatedAt);
  };

  public shared ({ caller }) func createScheme(title : Text, description : Text, couponCode : Text) : async Scheme {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create schemes");
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

  public shared ({ caller }) func deleteScheme(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete schemes");
    };
    if (not schemes.containsKey(id)) {
      Runtime.trap("Scheme not found");
    };
    schemes.remove(id);
  };
};
