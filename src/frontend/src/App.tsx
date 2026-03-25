import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Droplets,
  Heart,
  Instagram,
  Leaf,
  Mail,
  RefreshCw,
  Search,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { SiPinterest, SiTiktok } from "react-icons/si";
import { toast } from "sonner";
import type { BlogPost, Collection, Product } from "./backend.d";
import {
  useAddToCart,
  useGetBlogPosts,
  useGetCollections,
  useGetProducts,
} from "./hooks/useQueries";

const queryClient = new QueryClient();

// ── Static fallback data ──────────────────────────────────────────────────────
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1n,
    name: "Radiance Renewal Serum",
    description: "Brightening vitamin C serum with hyaluronic acid",
    category: "skincare" as any,
    rating: 4.8,
    reviewCount: 312n,
    price: 58,
    imageId: "serum",
  },
  {
    id: 2n,
    name: "Velvet Lip Gloss",
    description: "Buildable color with plumping peptide complex",
    category: "makeup" as any,
    rating: 4.6,
    reviewCount: 215n,
    price: 28,
    imageId: "lipgloss",
  },
  {
    id: 3n,
    name: "Cloud Cream Moisturizer",
    description: "Lightweight 48-hour hydration with ceramides",
    category: "skincare" as any,
    rating: 4.9,
    reviewCount: 489n,
    price: 45,
    imageId: "moisturizer",
  },
  {
    id: 4n,
    name: "Rose Glow Palette",
    description: "10 shades of warm rose gold and champagne",
    category: "makeup" as any,
    rating: 4.7,
    reviewCount: 178n,
    price: 62,
    imageId: "eyeshadow",
  },
];

const FALLBACK_COLLECTIONS: Collection[] = [
  {
    id: 1n,
    name: "Skincare",
    description: "Glow-boosting serums & creams",
    imageId: "skincare",
  },
  {
    id: 2n,
    name: "Makeup",
    description: "Colors crafted for every skin tone",
    imageId: "makeup",
  },
  {
    id: 3n,
    name: "Wellness",
    description: "Rituals for mind, body & soul",
    imageId: "wellness",
  },
];

const FALLBACK_BLOGS: BlogPost[] = [
  {
    id: 1n,
    title: "The 5-Minute Skincare Ritual for Radiant Skin",
    content: "",
    date: "March 12, 2026",
    excerpt:
      "Discover the simple morning routine that celebrity facialists swear by — minimal steps, maximum glow.",
    imageId: "skincare-routine",
  },
  {
    id: 2n,
    title: "How to Layer Makeup for an All-Day Flawless Finish",
    content: "",
    date: "March 5, 2026",
    excerpt:
      "From primer to setting spray, we break down the exact layering technique for a look that lasts 12 hours.",
    imageId: "makeup-tips",
  },
  {
    id: 3n,
    title: "Wellness Reset: Building Your Evening Ritual",
    content: "",
    date: "February 28, 2026",
    excerpt:
      "A calming end-of-day routine using botanical ingredients to restore, repair, and prepare skin for tomorrow.",
    imageId: "wellness",
  },
];

// 4K Unsplash images for cosmetics/beauty
const productImages: Record<string, string> = {
  serum:
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=3840&q=100",
  lipgloss:
    "https://images.unsplash.com/photo-1586495777744-4e6232bf2d00?w=3840&q=100",
  moisturizer:
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=3840&q=100",
  eyeshadow:
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=3840&q=100",
};

const collectionImages: Record<string, string> = {
  skincare:
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=3840&q=100",
  makeup:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=3840&q=100",
  wellness:
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=3840&q=100",
};

const blogImages: Record<string, string> = {
  "skincare-routine":
    "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=3840&q=100",
  "makeup-tips":
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=3840&q=100",
  wellness:
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=3840&q=100",
};

const heroImage =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=3840&q=100";

const NAV_LINKS = [
  "New Arrivals",
  "Skincare",
  "Makeup",
  "Hair",
  "Gifts",
  "Wellness",
];

function StarRating({ rating, count }: { rating: number; count: bigint }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        ({count.toString()})
      </span>
    </div>
  );
}

function ProductCard({
  product,
  onAddToBag,
}: {
  product: Product;
  onAddToBag: (id: bigint) => void;
}) {
  const imgSrc =
    productImages[product.imageId] ||
    productImages[Object.keys(productImages)[0]];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-lg overflow-hidden border border-glow-border shadow-soft group"
    >
      <div className="overflow-hidden aspect-square">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-serif font-bold text-foreground text-sm leading-tight">
          {product.name}
        </h3>
        <StarRating rating={product.rating} count={product.reviewCount} />
        <div className="flex items-center justify-between mt-1">
          <span className="font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
        </div>
        <button
          type="button"
          data-ocid="products.add_button"
          onClick={() => onAddToBag(product.id)}
          className="mt-1 w-full bg-glow-orange text-white text-xs font-bold py-2.5 rounded hover:bg-glow-orange-deep transition-colors"
        >
          Add to Bag
        </button>
      </div>
    </motion.div>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  const imgSrc =
    collectionImages[collection.imageId.toLowerCase()] ||
    collectionImages.skincare;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-lg aspect-[3/4] group cursor-pointer"
    >
      <img
        src={imgSrc}
        alt={collection.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="font-serif text-2xl font-bold">{collection.name}</h3>
        <p className="text-white/80 text-sm mt-1 font-bold">
          {collection.description}
        </p>
        <span className="inline-block mt-3 text-xs font-bold tracking-wider uppercase border-b border-glow-orange pb-0.5 text-glow-orange-light">
          Shop Now
        </span>
      </div>
    </motion.div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const imgSrc = blogImages[post.imageId] || blogImages["skincare-routine"];
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-lg overflow-hidden border border-glow-border shadow-soft"
    >
      <div className="overflow-hidden aspect-[3/2]">
        <img
          src={imgSrc}
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex flex-col gap-2">
        <span className="text-xs text-muted-foreground font-bold">
          {post.date}
        </span>
        <h3 className="font-serif text-lg font-bold leading-snug text-foreground">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 font-bold">
          {post.excerpt}
        </p>
        <a
          href="/"
          data-ocid="blog.link"
          className="mt-2 text-sm font-bold text-glow-orange hover:text-glow-orange-deep transition-colors inline-flex items-center gap-1"
        >
          Learn More →
        </a>
      </div>
    </motion.article>
  );
}

function GlowrangeApp() {
  const [cartCount, setCartCount] = useState(0);
  const [email, setEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: products } = useGetProducts();
  const { data: collections } = useGetCollections();
  const { data: blogPosts } = useGetBlogPosts();
  const addToCart = useAddToCart();

  const displayProducts = (
    products && products.length > 0 ? products : FALLBACK_PRODUCTS
  ).slice(0, 4);
  const displayCollections =
    collections && collections.length > 0 ? collections : FALLBACK_COLLECTIONS;
  const displayBlogs =
    blogPosts && blogPosts.length > 0 ? blogPosts : FALLBACK_BLOGS;

  const handleAddToBag = useCallback(
    async (productId: bigint) => {
      try {
        await addToCart.mutateAsync({ productId, quantity: 1n });
      } catch {
        // backend might not be available, still update UI
      }
      setCartCount((prev) => prev + 1);
      toast.success("Added to bag!");
    },
    [addToCart],
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the list! Welcome to Glowrange.");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Announcement Bar */}
      <div className="bg-glow-orange text-white text-center text-xs py-2 px-4 tracking-wide font-bold">
        Free shipping on orders over $50 &nbsp;|&nbsp; Modern, Elegant &amp;
        Feminine
      </div>

      {/* Header */}
      <header className="bg-secondary border-b border-glow-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top row */}
          <div className="flex items-center justify-between py-4">
            {/* Logo mark */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-glow-orange flex items-center justify-center">
                <span className="text-white font-serif text-xs font-bold">
                  G
                </span>
              </div>
            </div>

            {/* Brand wordmark */}
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Glowrange
            </h1>

            {/* Utility icons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                data-ocid="header.button"
                aria-label="Account"
                className="p-1.5 hover:text-glow-orange transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                type="button"
                data-ocid="wishlist.button"
                aria-label="Wishlist"
                className="p-1.5 hover:text-glow-orange transition-colors"
              >
                <Heart className="h-5 w-5" />
              </button>
              <button
                type="button"
                data-ocid="cart.button"
                aria-label="Cart"
                className="p-1.5 hover:text-glow-orange transition-colors relative"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-glow-orange text-white border-0">
                    {cartCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="border-t border-glow-border">
            <div className="hidden md:flex items-center justify-center gap-8 py-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href="/"
                  data-ocid="nav.link"
                  className="text-sm font-bold text-muted-foreground hover:text-glow-orange transition-colors tracking-wide"
                >
                  {link}
                </a>
              ))}
              <button
                type="button"
                data-ocid="search.button"
                aria-label="Search"
                className="ml-2 text-muted-foreground hover:text-glow-orange transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            {/* Mobile nav toggle */}
            <div className="md:hidden flex items-center justify-between py-2">
              <button
                type="button"
                data-ocid="nav.toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-sm font-bold text-muted-foreground"
              >
                {mobileMenuOpen ? "Close" : "Menu"}
              </button>
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            {mobileMenuOpen && (
              <div className="md:hidden pb-3 flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link}
                    href="/"
                    className="text-sm font-bold text-muted-foreground py-1.5 border-b border-glow-border"
                  >
                    {link}
                  </a>
                ))}
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[560px] sm:min-h-[680px] flex items-center">
          <img
            src={heroImage}
            alt="Glowrange hero — radiant natural glow"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-lg"
            >
              <span className="text-white/80 text-xs tracking-[0.2em] uppercase mb-4 block font-bold">
                New Spring Collection
              </span>
              <h2 className="font-serif text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-4">
                Radiate Your Natural Glow
              </h2>
              <p className="text-white/85 text-base sm:text-lg mb-8 leading-relaxed font-bold">
                Discover clean, cruelty-free beauty crafted for every
                complexion. Where nature meets luxury.
              </p>
              <button
                type="button"
                data-ocid="hero.primary_button"
                className="inline-block bg-glow-orange text-white font-bold px-8 py-3.5 rounded hover:bg-glow-orange-deep transition-colors text-sm tracking-wide shadow-lg"
              >
                Shop New Arrivals
              </button>
            </motion.div>
          </div>
        </section>

        {/* Shop by Collection */}
        <section
          className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto"
          data-ocid="collections.section"
        >
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl sm:text-4xl text-center text-foreground mb-10 font-extrabold"
          >
            Shop by Collection
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {displayCollections.map((col) => (
              <CollectionCard key={col.id.toString()} collection={col} />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section
          className="py-16 sm:py-20 bg-secondary"
          data-ocid="products.section"
        >
          <div className="px-4 sm:px-6 max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-3xl sm:text-4xl text-center text-foreground mb-10 font-extrabold"
            >
              Featured Products
            </motion.h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  onAddToBag={handleAddToBag}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Glowrange Promise */}
        <section
          className="py-16 sm:py-20 px-4 sm:px-6"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.82 0.14 55) 0%, oklch(0.72 0.18 50) 100%)",
          }}
          data-ocid="promise.section"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-3xl sm:text-4xl text-white mb-12 font-extrabold"
            >
              The Glowrange Promise
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  icon: <Leaf className="h-8 w-8" />,
                  label: "Cruelty-Free",
                  desc: "Every formula is certified cruelty-free. Beauty that's kind to animals and the planet.",
                },
                {
                  icon: <Droplets className="h-8 w-8" />,
                  label: "Clean Ingredients",
                  desc: "No parabens, sulfates, or synthetic dyes. Just pure, skin-loving ingredients.",
                },
                {
                  icon: <RefreshCw className="h-8 w-8" />,
                  label: "Sustainable",
                  desc: "Eco-conscious packaging and carbon-neutral shipping on every order.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="text-white">{item.icon}</div>
                  <h3 className="font-serif text-xl font-extrabold text-white">
                    {item.label}
                  </h3>
                  <p className="text-sm text-white/85 leading-relaxed font-bold">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog */}
        <section
          className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto"
          data-ocid="blog.section"
        >
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl sm:text-4xl text-center text-foreground mb-10 font-extrabold"
          >
            Latest from the Blog
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {displayBlogs.map((post) => (
              <BlogCard key={post.id.toString()} post={post} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="bg-glow-charcoal text-white"
        data-ocid="footer.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <h3 className="font-serif text-2xl font-extrabold mb-4">
                Glowrange
              </h3>
              <p className="text-white/60 text-sm leading-relaxed font-bold">
                Clean, cruelty-free beauty for every glow. Rooted in nature,
                elevated by science.
              </p>
              <div className="flex gap-4 mt-5">
                <a
                  data-ocid="footer.link"
                  href="/"
                  aria-label="Instagram"
                  className="text-white/60 hover:text-glow-orange-light transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  data-ocid="footer.link"
                  href="/"
                  aria-label="TikTok"
                  className="text-white/60 hover:text-glow-orange-light transition-colors"
                >
                  <SiTiktok className="h-5 w-5" />
                </a>
                <a
                  data-ocid="footer.link"
                  href="/"
                  aria-label="Pinterest"
                  className="text-white/60 hover:text-glow-orange-light transition-colors"
                >
                  <SiPinterest className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Shop links */}
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase mb-4">
                Shop
              </h4>
              <ul className="space-y-2">
                {[
                  "New Arrivals",
                  "Skincare",
                  "Makeup",
                  "Hair",
                  "Gifts",
                  "Wellness",
                ].map((l) => (
                  <li key={l}>
                    <a
                      href="/"
                      data-ocid="footer.link"
                      className="text-sm text-white/60 hover:text-white transition-colors font-bold"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* About links */}
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase mb-4">
                About
              </h4>
              <ul className="space-y-2">
                {[
                  "Our Story",
                  "Ingredients",
                  "Sustainability",
                  "Careers",
                  "Press",
                  "Contact",
                ].map((l) => (
                  <li key={l}>
                    <a
                      href="/"
                      data-ocid="footer.link"
                      className="text-sm text-white/60 hover:text-white transition-colors font-bold"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase mb-4">
                Stay in the Glow
              </h4>
              <p className="text-sm text-white/60 mb-4 font-bold">
                Get early access to launches and exclusive offers.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <Input
                  data-ocid="newsletter.input"
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-glow-orange font-bold"
                />
                <Button
                  data-ocid="newsletter.submit_button"
                  type="submit"
                  className="bg-glow-orange text-white hover:bg-glow-orange-deep font-bold"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40 font-bold">
              © {new Date().getFullYear()} Glowrange. All rights reserved.
            </p>
            <p className="text-xs text-white/40 font-bold">
              Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                className="underline hover:text-white/70 transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlowrangeApp />
    </QueryClientProvider>
  );
}
