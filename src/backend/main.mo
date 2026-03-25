import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

actor {
  type Category = {
    #skincare;
    #makeup;
    #hair;
    #wellness;
    #gifts;
  };

  module Category {
    public func toText(category : Category) : Text {
      switch (category) {
        case (#skincare) { "skincare" };
        case (#makeup) { "makeup" };
        case (#hair) { "hair" };
        case (#wellness) { "wellness" };
        case (#gifts) { "gifts" };
      };
    };
  };

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    category : Category;
    rating : Float;
    reviewCount : Nat;
    imageId : Text;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };

    public func compareByPrice(product1 : Product, product2 : Product) : Order.Order {
      Float.compare(product1.price, product2.price);
    };
  };

  type Collection = {
    id : Nat;
    name : Text;
    description : Text;
    imageId : Text;
  };

  module Collection {
    public func compare(collection1 : Collection, collection2 : Collection) : Order.Order {
      Nat.compare(collection1.id, collection2.id);
    };
  };

  type BlogPost = {
    id : Nat;
    title : Text;
    excerpt : Text;
    content : Text;
    imageId : Text;
    date : Text;
  };

  module BlogPost {
    public func compare(blogPost1 : BlogPost, blogPost2 : BlogPost) : Order.Order {
      Nat.compare(blogPost1.id, blogPost2.id);
    };
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  module CartItem {
    public func compare(cartItem1 : CartItem, cartItem2 : CartItem) : Order.Order {
      Nat.compare(cartItem1.productId, cartItem2.productId);
    };
  };

  let products = Map.empty<Nat, Product>();
  let collections = Map.empty<Nat, Collection>();
  let blogPosts = Map.empty<Nat, BlogPost>();
  let carts = Map.empty<Principal, Map.Map<Nat, CartItem>>();
  let wishlists = Map.empty<Principal, Map.Map<Nat, ()>>();

  func getCartMap(caller : Principal) : Map.Map<Nat, CartItem> {
    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart does not exist") };
      case (?cartMap) { cartMap };
    };
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (quantity == 0) { Runtime.trap("Quantity must be greater than 0") };
    let cartMap = switch (carts.get(caller)) {
      case (null) { Map.empty<Nat, CartItem>() };
      case (?cartMap) { cartMap };
    };
    let existingQuantity = switch (cartMap.get(productId)) {
      case (null) { 0 };
      case (?item) { item.quantity };
    };
    cartMap.add(productId, { productId; quantity = quantity + existingQuantity });
    carts.add(caller, cartMap);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    let cartMap = getCartMap(caller);
    cartMap.remove(productId);
    carts.add(caller, cartMap);
  };

  public shared ({ caller }) func clearCart() : async () {
    carts.remove(caller);
  };

  public shared ({ caller }) func getCart() : async [CartItem] {
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cartMap) { cartMap.values().toArray().sort() };
    };
  };

  public shared ({ caller }) func addToWishlist(productId : Nat) : async () {
    let wishlistMap = switch (wishlists.get(caller)) {
      case (null) { Map.empty<Nat, ()>() };
      case (?wishlistMap) { wishlistMap };
    };
    wishlistMap.add(productId, ());
    wishlists.add(caller, wishlistMap);
  };

  public shared ({ caller }) func removeFromWishlist(productId : Nat) : async () {
    switch (wishlists.get(caller)) {
      case (null) { () };
      case (?wishlistMap) {
        wishlistMap.remove(productId);
        wishlists.add(caller, wishlistMap);
      };
    };
  };

  public shared ({ caller }) func getWishlist() : async [Nat] {
    switch (wishlists.get(caller)) {
      case (null) { [] };
      case (?wishlistMap) { wishlistMap.keys().toArray().sort() };
    };
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func getProductsByCategory(category : Category) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category }).sort();
  };

  public query ({ caller }) func getProductById(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getProductsByCategoryText(category : Text) : async [Product] {
    let categoryVariant = switch (category) {
      case ("skincare") { #skincare };
      case ("makeup") { #makeup };
      case ("hair") { #hair };
      case ("wellness") { #wellness };
      case ("gifts") { #gifts };
      case (_) { Runtime.trap("Invalid category") };
    };
    products.values().toArray().filter(func(p) { p.category == categoryVariant }).sort();
  };

  public query ({ caller }) func getCollections() : async [Collection] {
    collections.values().toArray().sort();
  };

  public query ({ caller }) func getBlogPosts() : async [BlogPost] {
    blogPosts.values().toArray().sort();
  };

  public query ({ caller }) func getProductCount() : async Nat {
    products.size();
  };

  public query ({ caller }) func getCollectionCount() : async Nat {
    collections.size();
  };

  public query ({ caller }) func getBlogPostCount() : async Nat {
    blogPosts.size();
  };

  public shared ({ caller }) func hasInCart(productId : Nat) : async Bool {
    carts.get(caller).isSome() and getCartMap(caller).containsKey(productId);
  };

  public shared ({ caller }) func hasInWishlist(productId : Nat) : async Bool {
    switch (wishlists.get(caller)) {
      case (null) { false };
      case (?wishlistMap) { wishlistMap.containsKey(productId) };
    };
  };

  let sampleProducts = [
    {
      id = 1;
      name = "Hydrating Face Serum";
      description = "Intense hydration for glowing skin";
      price = 49.99;
      category = #skincare;
      rating = 4.6;
      reviewCount = 250;
      imageId = "hydra_face_serum_img494";
    },
    {
      id = 2;
      name = "Volumizing Mascara";
      description = "Lifts and defines lashes";
      price = 24.99;
      category = #makeup;
      rating = 4.5;
      reviewCount = 130;
      imageId = "volume_mascara_img43";
    },
    {
      id = 3;
      name = "Silky Hair Conditioner";
      description = "Smooths and strengthens hair";
      price = 17.99;
      category = #hair;
      rating = 4.7;
      reviewCount = 95;
      imageId = "hair_conditioner_img48";
    },
    {
      id = 4;
      name = "Wellness Soy Candle";
      description = "Calming aroma therapy";
      price = 14.99;
      category = #wellness;
      rating = 4.8;
      reviewCount = 60;
      imageId = "soy_candle_img82";
    },
    {
      id = 5;
      name = "Holiday Gift Set";
      description = "Exclusive skincare and makeup bundle";
      price = 74.99;
      category = #gifts;
      rating = 4.9;
      reviewCount = 40;
      imageId = "gift_set_img522";
    },
    {
      id = 6;
      name = "Brightening Eye Cream";
      description = "Reduces puffiness and dark circles";
      price = 29.99;
      category = #skincare;
      rating = 4.6;
      reviewCount = 180;
      imageId = "eye_cream_img394";
    },
    {
      id = 7;
      name = "Velvet Lipstick";
      description = "Rich color & long-lasting wear";
      price = 22.99;
      category = #makeup;
      rating = 4.7;
      reviewCount = 110;
      imageId = "lipstick_img888";
    },
    {
      id = 8;
      name = "Detangling Hair Spray";
      description = "Prevents breakage and knots";
      price = 15.99;
      category = #hair;
      rating = 4.5;
      reviewCount = 75;
      imageId = "hair_spray_img919";
    },
  ];

  let sampleCollections = [
    {
      id = 1;
      name = "Skincare Essentials";
      description = "Curated collection for healthy skin";
      imageId = "skincare_collection_img";
    },
    {
      id = 2;
      name = "Makeup Must-Haves";
      description = "Top picks for flawless beauty";
      imageId = "makeup_collection_img";
    },
    {
      id = 3;
      name = "Wellness & Spa";
      description = "Relaxation and self-care items";
      imageId = "wellness_collection_img";
    },
  ];

  let sampleBlogPosts = [
    {
      id = 1;
      title = "Winter Skincare Tips";
      excerpt = "Protect your skin during cold months";
      content = "Cold weather can dry out your skin. Keeping it hydrated...";
      imageId = "skincare_blog_img";
      date = "2024-01-06";
    },
    {
      id = 2;
      title = "Makeup Trends 2024";
      excerpt = "Latest looks dominating runways";
      content = "Bold lips and dewy skin are in for 2024's makeup trends!";
      imageId = "makeup_blog_img";
      date = "2024-02-18";
    },
    {
      id = 3;
      title = "Wellness Rituals";
      excerpt = "Incorporate relaxation into your routine";
      content = "Taking time for yourself is essential. Candles and essential oils are great...";
      imageId = "wellness_blog_img";
      date = "2024-03-09";
    },
  ];

  for (product in sampleProducts.values()) {
    products.add(product.id, product);
  };
  for (collection in sampleCollections.values()) {
    collections.add(collection.id, collection);
  };
  for (post in sampleBlogPosts.values()) {
    blogPosts.add(post.id, post);
  };
};
