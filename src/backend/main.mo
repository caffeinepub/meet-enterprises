import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Migration "migration";

(with migration = Migration.run)
actor {

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

  public type ProductSummary = {
    id : Nat;
    name : Text;
    description : Text;
    mrp : Nat;
    discountAmount : Nat;
    categoryId : Nat;
    sizes : [Text];
    colours : [Text];
    inStock : Bool;
  };

  public type ProductImage = {
    imageData : Blob;
    imageType : Text;
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

  public type Reel = {
    id : Nat;
    title : Text;
    videoUrl : Text;
    productId : ?Nat;
    createdAt : Int;
  };

  public type ProductRating = {
    productId : Nat;
    userId : Principal;
    rating : Nat;
    createdAt : Int;
  };

  public type RatingSummary = {
    average : Float;
    count : Nat;
  };

  public type ReelComment = {
    id : Nat;
    reelId : Nat;
    userId : Principal;
    userName : Text;
    text : Text;
    createdAt : Int;
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

  func compareReelByCreatedAt(r1 : Reel, r2 : Reel) : Order.Order {
    if (r1.createdAt > r2.createdAt) { #less } else if (r1.createdAt < r2.createdAt) {
      #greater;
    } else {
      Nat.compare(r1.id, r2.id);
    };
  };

  func compareCommentByCreatedAt(c1 : ReelComment, c2 : ReelComment) : Order.Order {
    if (c1.createdAt < c2.createdAt) { #less } else if (c1.createdAt > c2.createdAt) {
      #greater;
    } else {
      Nat.compare(c1.id, c2.id);
    };
  };

  // ── Stable backing storage ───────────────────────────────────────────
  stable var _stableUserProfiles        : [(Principal, UserProfile)]  = [];
  stable var _stableCategories          : [(Nat, Category)]           = [];
  stable var _stableProducts            : [(Nat, Product)]            = [];
  stable var _stableOrders              : [(Text, Order)]             = [];
  stable var _stableVouchers            : [(Nat, Voucher)]            = [];
  stable var _stableSchemes             : [(Nat, Scheme)]             = [];
  stable var _stableReels               : [(Nat, Reel)]               = [];
  stable var _stableWishlists           : [(Principal, [Nat])]        = [];
  stable var _stableDeliveryCodes       : [(Text, Text)]              = [];
  stable var _stableRatings             : [(Text, ProductRating)]     = [];
  stable var _stableReelComments        : [(Text, ReelComment)]       = [];
  stable var _stableReelLikes           : [(Text, Bool)]              = [];
  stable var _stableAdditionalImages    : [(Nat, [ProductImage])]     = [];

  var nextCategoryId  : Nat = 1;
  var nextProductId   : Nat = 1;
  var nextVoucherId   : Nat = 1;
  var nextSchemeId    : Nat = 1;
  var nextReelId      : Nat = 1;
  var nextCommentId   : Nat = 1;
  stable var _nextCategoryId  : Nat = 1;
  stable var _nextProductId   : Nat = 1;
  stable var _nextVoucherId   : Nat = 1;
  stable var _nextSchemeId    : Nat = 1;
  stable var _nextReelId      : Nat = 1;
  stable var _nextCommentId   : Nat = 1;
  stable var paymentSettings  : ?PaymentSettings = null;
  stable var currentTheme     : Text = "bone-white";
  stable var instagramHandle  : Text = "";

  // ── In-memory Maps ────────────────────────────────────────────────────
  let userProfiles       = Map.empty<Principal, UserProfile>();
  let categories         = Map.empty<Nat, Category>();
  let products           = Map.empty<Nat, Product>();
  let orders             = Map.empty<Text, Order>();
  let vouchers           = Map.empty<Nat, Voucher>();
  let schemes            = Map.empty<Nat, Scheme>();
  let reels              = Map.empty<Nat, Reel>();
  let wishlists          = Map.empty<Principal, [Nat]>();
  let deliveryCodes      = Map.empty<Text, Text>();
  let ratings            = Map.empty<Text, ProductRating>();
  let reelComments       = Map.empty<Text, ReelComment>();
  let reelLikes          = Map.empty<Text, Bool>();
  let additionalImages   = Map.empty<Nat, [ProductImage]>();

  do {
    for ((k, v) in _stableUserProfiles.vals())     { userProfiles.add(k, v) };
    for ((k, v) in _stableCategories.vals())        { categories.add(k, v) };
    for ((k, v) in _stableProducts.vals())          { products.add(k, v) };
    for ((k, v) in _stableOrders.vals())            { orders.add(k, v) };
    for ((k, v) in _stableVouchers.vals())          { vouchers.add(k, v) };
    for ((k, v) in _stableSchemes.vals())           { schemes.add(k, v) };
    for ((k, v) in _stableReels.vals())             { reels.add(k, v) };
    for ((k, v) in _stableWishlists.vals())         { wishlists.add(k, v) };
    for ((k, v) in _stableDeliveryCodes.vals())     { deliveryCodes.add(k, v) };
    for ((k, v) in _stableRatings.vals())           { ratings.add(k, v) };
    for ((k, v) in _stableReelComments.vals())      { reelComments.add(k, v) };
    for ((k, v) in _stableReelLikes.vals())         { reelLikes.add(k, v) };
    for ((k, v) in _stableAdditionalImages.vals())  { additionalImages.add(k, v) };
    nextCategoryId := _nextCategoryId;
    nextProductId  := _nextProductId;
    nextVoucherId  := _nextVoucherId;
    nextSchemeId   := _nextSchemeId;
    nextReelId     := _nextReelId;
    nextCommentId  := _nextCommentId;
    _stableUserProfiles      := [];
    _stableCategories        := [];
    _stableProducts          := [];
    _stableOrders            := [];
    _stableVouchers          := [];
    _stableSchemes           := [];
    _stableReels             := [];
    _stableWishlists         := [];
    _stableDeliveryCodes     := [];
    _stableRatings           := [];
    _stableReelComments      := [];
    _stableReelLikes         := [];
    _stableAdditionalImages  := [];
  };

  system func preupgrade() {
    let up = List.empty<(Principal, UserProfile)>();
    userProfiles.forEach(func(k, v) { up.add((k, v)) });
    _stableUserProfiles := up.toArray();

    let cp = List.empty<(Nat, Category)>();
    categories.forEach(func(k, v) { cp.add((k, v)) });
    _stableCategories := cp.toArray();

    let pp = List.empty<(Nat, Product)>();
    products.forEach(func(k, v) { pp.add((k, v)) });
    _stableProducts := pp.toArray();

    let op = List.empty<(Text, Order)>();
    orders.forEach(func(k, v) { op.add((k, v)) });
    _stableOrders := op.toArray();

    let vp = List.empty<(Nat, Voucher)>();
    vouchers.forEach(func(k, v) { vp.add((k, v)) });
    _stableVouchers := vp.toArray();

    let sp = List.empty<(Nat, Scheme)>();
    schemes.forEach(func(k, v) { sp.add((k, v)) });
    _stableSchemes := sp.toArray();

    let rp = List.empty<(Nat, Reel)>();
    reels.forEach(func(k, v) { rp.add((k, v)) });
    _stableReels := rp.toArray();

    let wp = List.empty<(Principal, [Nat])>();
    wishlists.forEach(func(k, v) { wp.add((k, v)) });
    _stableWishlists := wp.toArray();

    let dp = List.empty<(Text, Text)>();
    deliveryCodes.forEach(func(k, v) { dp.add((k, v)) });
    _stableDeliveryCodes := dp.toArray();

    let ratp = List.empty<(Text, ProductRating)>();
    ratings.forEach(func(k, v) { ratp.add((k, v)) });
    _stableRatings := ratp.toArray();

    let rcp = List.empty<(Text, ReelComment)>();
    reelComments.forEach(func(k, v) { rcp.add((k, v)) });
    _stableReelComments := rcp.toArray();

    let rlp = List.empty<(Text, Bool)>();
    reelLikes.forEach(func(k, v) { rlp.add((k, v)) });
    _stableReelLikes := rlp.toArray();

    let aip = List.empty<(Nat, [ProductImage])>();
    additionalImages.forEach(func(k, v) { aip.add((k, v)) });
    _stableAdditionalImages := aip.toArray();

    _nextCategoryId := nextCategoryId;
    _nextProductId  := nextProductId;
    _nextVoucherId  := nextVoucherId;
    _nextSchemeId   := nextSchemeId;
    _nextReelId     := nextReelId;
    _nextCommentId  := nextCommentId;
  };

  system func postupgrade() {
    for ((k, v) in _stableUserProfiles.vals())     { userProfiles.add(k, v) };
    for ((k, v) in _stableCategories.vals())        { categories.add(k, v) };
    for ((k, v) in _stableProducts.vals())          { products.add(k, v) };
    for ((k, v) in _stableOrders.vals())            { orders.add(k, v) };
    for ((k, v) in _stableVouchers.vals())          { vouchers.add(k, v) };
    for ((k, v) in _stableSchemes.vals())           { schemes.add(k, v) };
    for ((k, v) in _stableReels.vals())             { reels.add(k, v) };
    for ((k, v) in _stableWishlists.vals())         { wishlists.add(k, v) };
    for ((k, v) in _stableDeliveryCodes.vals())     { deliveryCodes.add(k, v) };
    for ((k, v) in _stableRatings.vals())           { ratings.add(k, v) };
    for ((k, v) in _stableReelComments.vals())      { reelComments.add(k, v) };
    for ((k, v) in _stableReelLikes.vals())         { reelLikes.add(k, v) };
    for ((k, v) in _stableAdditionalImages.vals())  { additionalImages.add(k, v) };
    nextCategoryId := _nextCategoryId;
    nextProductId  := _nextProductId;
    nextVoucherId  := _nextVoucherId;
    nextSchemeId   := _nextSchemeId;
    nextReelId     := _nextReelId;
    nextCommentId  := _nextCommentId;
    _stableUserProfiles      := [];
    _stableCategories        := [];
    _stableProducts          := [];
    _stableOrders            := [];
    _stableVouchers          := [];
    _stableSchemes           := [];
    _stableReels             := [];
    _stableWishlists         := [];
    _stableDeliveryCodes     := [];
    _stableRatings           := [];
    _stableReelComments      := [];
    _stableReelLikes         := [];
    _stableAdditionalImages  := [];
  };

  // ── Public read endpoints ─────────────────────────────────────────────

  public query func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public query func getProducts() : async [ProductSummary] {
    let summaries = List.empty<ProductSummary>();
    products.forEach(func(_k, p : Product) {
      summaries.add({
        id = p.id;
        name = p.name;
        description = p.description;
        mrp = p.mrp;
        discountAmount = p.discountAmount;
        categoryId = p.categoryId;
        sizes = p.sizes;
        colours = p.colours;
        inStock = p.inStock;
      });
    });
    summaries.toArray();
  };

  public query func getProductById(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // Returns all images for a product: primary image first, then additional images
  public query func getProductImages(productId : Nat) : async [ProductImage] {
    switch (products.get(productId)) {
      case (null) { [] };
      case (?product) {
        let result = List.empty<ProductImage>();
        result.add({ imageData = product.image; imageType = product.imageType });
        switch (additionalImages.get(productId)) {
          case (?imgs) {
            for (img in imgs.vals()) { result.add(img) };
          };
          case null {};
        };
        result.toArray();
      };
    };
  };

  public shared func addProductImage(adminToken : Text, productId : Nat, imageData : Blob, imageType : Text) : async Nat {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    if (not products.containsKey(productId)) { Runtime.trap("Product not found") };
    let current = switch (additionalImages.get(productId)) { case (?imgs) imgs; case null [] };
    // Max 6 additional images (7 total including primary)
    let newList = List.empty<ProductImage>();
    for (img in current.vals()) { newList.add(img) };
    newList.add({ imageData; imageType });
    let newArr = newList.toArray();
    additionalImages.add(productId, newArr);
    newArr.size();
  };

  public shared func removeProductImage(adminToken : Text, productId : Nat, imageIndex : Nat) : async () {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    // imageIndex 0 = primary image (cannot remove), 1+ = additional images (index - 1 in additionalImages array)
    if (imageIndex == 0) { Runtime.trap("Cannot remove the primary image. Update it by editing the product instead.") };
    let additionalIndex = imageIndex - 1;
    switch (additionalImages.get(productId)) {
      case (null) { Runtime.trap("No additional images found") };
      case (?imgs) {
        if (additionalIndex >= imgs.size()) { Runtime.trap("Image index out of range") };
        let newList = List.empty<ProductImage>();
        var i : Nat = 0;
        for (img in imgs.vals()) {
          if (i != additionalIndex) { newList.add(img) };
          i += 1;
        };
        additionalImages.add(productId, newList.toArray());
      };
    };
  };

  public query func getSchemes() : async [Scheme] {
    schemes.values().toArray().sort(compareSchemeByCreatedAt);
  };

  public query func getPaymentSettings() : async ?PaymentSettings {
    paymentSettings;
  };

  public query func getTheme() : async Text {
    currentTheme;
  };

  public query func getReels() : async [Reel] {
    reels.values().toArray().sort(compareReelByCreatedAt);
  };

  public query func getProductRating(productId : Nat) : async RatingSummary {
    var total : Nat = 0;
    var count : Nat = 0;
    ratings.forEach(func(_k, r : ProductRating) {
      if (r.productId == productId) {
        total += r.rating;
        count += 1;
      };
    });
    if (count == 0) {
      { average = 0.0; count = 0 };
    } else {
      { average = total.toFloat() / count.toFloat(); count };
    };
  };

  public query func getInstagramHandle() : async Text {
    instagramHandle;
  };

  // ── Reel comments ────────────────────────────────────────────

  public shared ({ caller }) func addReelComment(reelId : Nat, text : Text) : async ReelComment {
    let userName = switch (userProfiles.get(caller)) {
      case (?p) p.name;
      case null "Guest";
    };
    let comment : ReelComment = {
      id = nextCommentId;
      reelId;
      userId = caller;
      userName;
      text;
      createdAt = Time.now();
    };
    let key = reelId.toText() # "-" # nextCommentId.toText();
    reelComments.add(key, comment);
    nextCommentId += 1;
    comment;
  };

  public query func getReelComments(reelId : Nat) : async [ReelComment] {
    let result = List.empty<ReelComment>();
    reelComments.forEach(func(_k, c : ReelComment) {
      if (c.reelId == reelId) { result.add(c) };
    });
    result.toArray().sort(compareCommentByCreatedAt);
  };

  // ── Reel likes ───────────────────────────────────────────────

  public shared ({ caller }) func likeReel(reelId : Nat) : async () {
    let key = reelId.toText() # "-" # caller.toText();
    reelLikes.add(key, true);
  };

  public shared ({ caller }) func unlikeReel(reelId : Nat) : async () {
    let key = reelId.toText() # "-" # caller.toText();
    reelLikes.remove(key);
  };

  public query func isReelLiked(reelId : Nat, userId : Principal) : async Bool {
    let key = reelId.toText() # "-" # userId.toText();
    switch (reelLikes.get(key)) { case (?v) v; case null false };
  };

  public query func getReelLikeCount(reelId : Nat) : async Nat {
    var count : Nat = 0;
    reelLikes.forEach(func(k, _v) {
      if (k.startsWith(#text (reelId.toText() # "-"))) { count += 1 };
    });
    count;
  };

  // ── User profile ────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller = _ }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(name : Text, whatsapp : Text) : async () {
    let userProfile : UserProfile = { id = caller; name; whatsapp };
    userProfiles.add(caller, userProfile);
  };

  // ── Orders ─────────────────────────────────────────────────

  public shared ({ caller }) func createOrder(items : [OrderItem], paymentMethod : Text, deliveryLocation : Text) : async Order {
    let totalAmount = items.foldLeft(0, func(acc, item) { acc + (item.price * item.quantity) });
    let orderId = "order-" # Time.now().toText();

    let order : Order = {
      id = orderId;
      userId = caller;
      items;
      totalAmount;
      paymentMethod;
      status = "Placed";
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

  public query ({ caller = _ }) func getUserOrders(userId : Principal) : async [Order] {
    let userOrders = List.empty<Order>();
    orders.forEach(func(_id, order) {
      if (order.userId == userId) { userOrders.add(order) };
    });
    userOrders.toArray().sort(compareOrderByCreatedAt);
  };

  public query ({ caller = _ }) func getUserVouchers(userId : Principal) : async [Voucher] {
    let userVouchers = List.empty<Voucher>();
    vouchers.forEach(func(_id, voucher) {
      if (voucher.userId == userId) { userVouchers.add(voucher) };
    });
    userVouchers.toArray().sort(compareVoucherByCreatedAt);
  };

  public query ({ caller = _ }) func getOrderById(orderId : Text) : async ?Order {
    orders.get(orderId);
  };

  // ── Wishlist ────────────────────────────────────────────────

  public shared ({ caller }) func addToWishlist(productId : Nat) : async () {
    let current = switch (wishlists.get(caller)) { case (?list) list; case null [] };
    let alreadyIn = current.find(func(id : Nat) : Bool { id == productId });
    switch (alreadyIn) {
      case (?_) {};
      case null {
        let newList = List.empty<Nat>();
        for (id in current.vals()) { newList.add(id) };
        newList.add(productId);
        wishlists.add(caller, newList.toArray());
      };
    };
  };

  public shared ({ caller }) func removeFromWishlist(productId : Nat) : async () {
    let current = switch (wishlists.get(caller)) { case (?list) list; case null [] };
    let filtered = current.filter(func(id : Nat) : Bool { id != productId });
    wishlists.add(caller, filtered);
  };

  public query func getUserWishlist(userId : Principal) : async [Nat] {
    switch (wishlists.get(userId)) { case (?list) list; case null [] };
  };

  // ── Ratings ─────────────────────────────────────────────────

  public shared ({ caller }) func rateProduct(productId : Nat, rating : Nat) : async () {
    if (rating < 1 or rating > 5) { Runtime.trap("Rating must be 1-5") };
    let key = productId.toText() # "-" # caller.toText();
    let r : ProductRating = { productId; userId = caller; rating; createdAt = Time.now() };
    ratings.add(key, r);
  };

  public query ({ caller }) func getUserProductRating(productId : Nat) : async ?Nat {
    let key = productId.toText() # "-" # caller.toText();
    switch (ratings.get(key)) { case (?r) ?r.rating; case null null };
  };

  // ── Delivery codes ──────────────────────────────────────────

  public shared func generateDeliveryCode(adminToken : Text, orderId : Text) : async Text {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    let seed = Time.now();
    let code = ((Int.abs(seed) % 9000) + 1000).toText();
    deliveryCodes.add(orderId, code);
    code;
  };

  public shared func getDeliveryCode(adminToken : Text, orderId : Text) : async ?Text {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    deliveryCodes.get(orderId);
  };

  public query func getOrderDeliveryCode(orderId : Text) : async ?Text {
    deliveryCodes.get(orderId);
  };

  public shared func verifyDeliveryCode(orderId : Text, code : Text) : async Bool {
    switch (deliveryCodes.get(orderId)) {
      case (null) { false };
      case (?stored) {
        if (stored == code) {
          switch (orders.get(orderId)) {
            case (?order) {
              let updated : Order = { order with status = "Delivered" };
              orders.add(orderId, updated);
            };
            case null {};
          };
          true;
        } else { false };
      };
    };
  };

  // ── Reels ────────────────────────────────────────────────────

  public shared func createReel(adminToken : Text, title : Text, videoUrl : Text, productId : ?Nat) : async Reel {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    let reel : Reel = { id = nextReelId; title; videoUrl; productId; createdAt = Time.now() };
    reels.add(nextReelId, reel);
    nextReelId += 1;
    reel;
  };

  public shared func deleteReel(adminToken : Text, id : Nat) : async () {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    if (not reels.containsKey(id)) { Runtime.trap("Reel not found") };
    reels.remove(id);
  };

  // ── Theme ────────────────────────────────────────────────────

  public shared func setTheme(adminToken : Text, themeId : Text) : async () {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    currentTheme := themeId;
  };

  // ── Instagram handle ─────────────────────────────────────────

  public shared func setInstagramHandle(adminToken : Text, handle : Text) : async () {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    instagramHandle := handle;
  };

  // ── Admin endpoints ──────────────────────────────────────────

  public shared func createCategory(adminToken : Text, name : Text) : async Category {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    let category : Category = { id = nextCategoryId; name };
    categories.add(nextCategoryId, category);
    nextCategoryId += 1;
    category;
  };

  public shared func updateCategory(adminToken : Text, id : Nat, name : Text) : async Category {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
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
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    if (not categories.containsKey(id)) { Runtime.trap("Category not found") };
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
  }) : async ProductSummary {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
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
    { id = product.id; name = product.name; description = product.description; mrp = product.mrp; discountAmount = product.discountAmount; categoryId = product.categoryId; sizes = product.sizes; colours = product.colours; inStock = product.inStock };
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
  }) : async ProductSummary {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existing) {
        let newImage = if (productInfo.image.size() == 0) { existing.image } else { productInfo.image };
        let newImageType = if (productInfo.imageType == "") { existing.imageType } else { productInfo.imageType };
        let product : Product = {
          id;
          name = productInfo.name;
          description = productInfo.description;
          mrp = productInfo.mrp;
          discountAmount = productInfo.discountAmount;
          categoryId = productInfo.categoryId;
          sizes = productInfo.sizes;
          colours = productInfo.colours;
          image = newImage;
          imageType = newImageType;
          inStock = productInfo.inStock;
        };
        products.add(id, product);
        { id = product.id; name = product.name; description = product.description; mrp = product.mrp; discountAmount = product.discountAmount; categoryId = product.categoryId; sizes = product.sizes; colours = product.colours; inStock = product.inStock };
      };
    };
  };

  public shared func deleteProduct(adminToken : Text, id : Nat) : async () {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    if (not products.containsKey(id)) { Runtime.trap("Product not found") };
    products.remove(id);
    additionalImages.remove(id);
  };

  public shared func updateOrderStatus(adminToken : Text, orderId : Text, status : Text) : async () {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = { order with status };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared func setPaymentSettings(adminToken : Text, upiId : Text, qrImage : Blob, qrImageType : Text) : async () {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    paymentSettings := ?{ upiId; qrImage; qrImageType };
  };

  public shared func getAllUsers(adminToken : Text) : async [UserProfile] {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    userProfiles.values().toArray();
  };

  public shared func getAllOrders(adminToken : Text) : async [Order] {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    orders.values().toArray().sort(compareOrderByCreatedAt);
  };

  public shared func getAllVouchers(adminToken : Text) : async [Voucher] {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    vouchers.values().toArray().sort(compareVoucherByCreatedAt);
  };


  public shared func deleteOrder(adminToken : Text, orderId : Text) : async () {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    ignore orders.remove(orderId);
    ignore deliveryCodes.remove(orderId);
  };
  public shared func createScheme(adminToken : Text, title : Text, description : Text, couponCode : Text) : async Scheme {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    let scheme : Scheme = { id = nextSchemeId; title; description; couponCode; createdAt = Time.now() };
    schemes.add(nextSchemeId, scheme);
    nextSchemeId += 1;
    scheme;
  };

  public shared func deleteScheme(adminToken : Text, id : Nat) : async () {
    if (not isValidAdmin(adminToken)) { Runtime.trap("Unauthorized: Invalid admin code") };
    if (not schemes.containsKey(id)) { Runtime.trap("Scheme not found") };
    schemes.remove(id);
  };
};
