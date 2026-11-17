package com.borrowbuddy.config;

import com.borrowbuddy.entity.*;
import com.borrowbuddy.repository.BorrowRequestRepository;
import com.borrowbuddy.repository.CategoryRepository;
import com.borrowbuddy.repository.ItemRepository;
import com.borrowbuddy.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Seeds demo data into MySQL on first start (only when the users table is empty).
 * Item images are served from /seed/*.jpg (bundled in src/main/resources/static/seed).
 */
@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository users;
    private final CategoryRepository categories;
    private final ItemRepository items;
    private final BorrowRequestRepository requests;
    private final PasswordEncoder encoder;
    private final boolean enabled;

    private final Map<String, User> u = new HashMap<>();
    private final Map<String, Category> c = new HashMap<>();
    private final Map<String, Item> it = new HashMap<>();

    public DataSeeder(UserRepository users, CategoryRepository categories, ItemRepository items,
                      BorrowRequestRepository requests, PasswordEncoder encoder,
                      @Value("${app.seed.enabled}") boolean enabled) {
        this.users = users;
        this.categories = categories;
        this.items = items;
        this.requests = requests;
        this.encoder = encoder;
        this.enabled = enabled;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled || users.count() > 0) return;
        log.info("Seeding BorrowBuddy demo data...");
        seedUsers();
        seedCategories();
        seedItems();
        seedRequests();
        log.info("Seeded {} users, {} categories, {} items, {} requests", users.count(), categories.count(),
                items.count(), requests.count());
    }

    private void user(String key, String name, String email, Role role, String pw, String phone, String loc, String bio) {
        User x = new User();
        x.setName(name);
        x.setEmail(email);
        x.setRole(role);
        x.setPasswordHash(encoder.encode(pw));
        x.setPhone(phone);
        x.setLocation(loc);
        x.setBio(bio);
        x.setCreatedAt(LocalDateTime.now().minusDays(20 + key.length() * 7L));
        u.put(key, users.save(x));
    }

    private void seedUsers() {
        String user = "Password@123";
        user("meera", "Meera Krishnan", "admin@borrowbuddy.in", Role.ADMIN, "Admin@123", "+91 98400 11001", "Adyar, Chennai",
                "Community manager at BorrowBuddy Chennai.");
        user("karthik", "Karthik Subramanian", "demo@borrowbuddy.in", Role.USER, user, "+91 98400 22002", "Anna Nagar, Chennai",
                "Weekend trekker and amateur photographer. Happy to lend gear to neighbours.");
        user("priya", "Priya Raman", "priya.raman@example.in", Role.USER, user, "+91 98410 33003", "T. Nagar, Chennai",
                "Home baker. I love sharing kitchen tools.");
        user("arjun", "Arjun Venkatesh", "arjun.v@example.in", Role.USER, user, "+91 98410 44004", "Velachery, Chennai",
                "DIY enthusiast with way too many power tools.");
        user("divya", "Divya Narayanan", "divya.n@example.in", Role.USER, user, "+91 98420 55005", "Mylapore, Chennai",
                "Carnatic music student and board-game host.");
        user("rohit", "Rohit Sharma", "rohit.s@example.in", Role.USER, user, "+91 98420 66006", "Porur, Chennai",
                "Cyclist and badminton regular.");
        user("fatima", "Fatima Sheikh", "fatima.s@example.in", Role.USER, user, "+91 98430 77007", "Tambaram, Chennai",
                "Travel blogger. Suitcases and camping gear to share.");
        user("suresh", "Suresh Babu", "suresh.b@example.in", Role.USER, user, "+91 98430 88008", "Guindy, Chennai",
                "Retired engineer, gardener, fixer of things.");
        user("ananya", "Ananya Iyer", "ananya.i@example.in", Role.USER, user, "+91 98440 99009", "Sholinganallur, OMR, Chennai",
                "Software engineer working from home on OMR.");
        user("vikram", "Vikram Rao", "vikram.r@example.in", Role.USER, user, "+91 98440 10010", "Chromepet, Chennai",
                "Bookworm and weekend guitarist.");
    }

    private void cat(String key, String name, String icon, String desc) {
        Category x = new Category();
        x.setName(name);
        x.setIcon(icon);
        x.setDescription(desc);
        c.put(key, categories.save(x));
    }

    private void seedCategories() {
        cat("tools", "Tools & DIY", "wrench", "Drills, ladders and gear for home projects");
        cat("electronics", "Electronics", "camera", "Cameras, projectors and speakers");
        cat("outdoors", "Outdoors & Camping", "tent", "Tents and weekend-trip essentials");
        cat("kitchen", "Kitchen", "chef-hat", "Mixers, cookers and appliances");
        cat("sports", "Sports & Fitness", "dumbbell", "Rackets, bikes and workout gear");
        cat("music", "Music", "music", "Instruments for practice and parties");
        cat("games", "Games & Books", "book-open", "Board games and reading material");
        cat("travel", "Travel", "luggage", "Suitcases and travel accessories");
        cat("home", "Home & Garden", "flower-2", "Cleaning, sewing and garden tools");
    }

    private void item(String key, String owner, String cat, String title, String desc, ItemCondition cond,
                      String loc, int price, String image, ItemStatus status) {
        Item x = new Item();
        x.setOwner(u.get(owner));
        x.setCategory(c.get(cat));
        x.setTitle(title);
        x.setDescription(desc);
        x.setCondition(cond);
        x.setLocation(loc);
        x.setDailyPrice(BigDecimal.valueOf(price));
        x.setImageUrl("/seed/" + image + ".jpg");
        x.setStatus(status);
        it.put(key, items.save(x));
    }

    private void seedItems() {
        ItemStatus A = ItemStatus.AVAILABLE;
        item("drill", "arjun", "tools", "Panasonic 18V Cordless Drill Driver",
                "Panasonic 18V cordless drill with two batteries, charger and a 30-piece bit set. Perfect for putting up shelves, curtain rods and flat-pack furniture. Please return with batteries charged.",
                ItemCondition.GOOD, "Velachery, Chennai", 0, "drill", A);
        item("ladder", "suresh", "tools", "Aluminium Step Ladder (6 ft)",
                "Sturdy foldable aluminium ladder with a safety lock. Ideal for painting, changing ceiling lights or reaching high shelves. Pick-up only - it fits in a hatchback with seats folded.",
                ItemCondition.GOOD, "Guindy, Chennai", 50, "ladder", A);
        item("camera", "karthik", "electronics", "Canon EOS DSLR with 18-55mm Lens",
                "Canon DSLR with kit lens, two batteries, 64GB SD card and a padded bag. Great for family events or a weekend trip. Please treat it gently and return the batteries charged.",
                ItemCondition.LIKE_NEW, "Anna Nagar, Chennai", 300, "camera", A);
        item("tent", "fatima", "outdoors", "4-Person Camping Tent with Rainfly",
                "Waterproof dome tent that pitches in ten minutes. Includes pegs, poles, carry bag and a footprint sheet. Used on trips to Yelagiri and Mahabalipuram beaches.",
                ItemCondition.GOOD, "Tambaram, Chennai", 150, "tent", A);
        item("bike", "rohit", "sports", "Hybrid Mountain Bike (21-Speed)",
                "Well-maintained 21-speed bike, medium frame, suits riders 5'6\" to 6'0\". Helmet and lock included. Great for ECR rides on a weekend morning.",
                ItemCondition.GOOD, "Porur, Chennai", 100, "bicycle", A);
        item("projector", "ananya", "electronics", "Full HD Portable Projector",
                "Full HD projector with HDMI cable and a small tripod. Movie nights, presentations, or cricket match screenings on a wall. Works with laptops and Fire Stick.",
                ItemCondition.LIKE_NEW, "Sholinganallur, OMR, Chennai", 250, "projector", A);
        item("mixer", "priya", "kitchen", "Electric Hand Mixer with Dough Hooks & Whisk",
                "Powerful 7-speed hand mixer with two dough hooks and a whisk attachment. Cakes, bread dough and whipped cream with zero effort. Cleaned and sanitized after every loan.",
                ItemCondition.LIKE_NEW, "T. Nagar, Chennai", 0, "mixer", A);
        item("badminton", "rohit", "sports", "Yonex Badminton Rackets (Set of 4)",
                "Four Yonex rackets, a net, and a tube of shuttlecocks. Take them to the court or set up in the apartment car park.",
                ItemCondition.GOOD, "Porur, Chennai", 0, "badminton", A);
        item("guitar", "vikram", "music", "Acoustic Guitar with Gig Bag",
                "Full-size acoustic guitar with fresh strings, capo, picks and a soft gig bag. Perfect for beginners who want to try before buying.",
                ItemCondition.GOOD, "Chromepet, Chennai", 80, "guitar", A);
        item("boardgame", "divya", "games", "Catan & Strategy Board Game Bundle",
                "Catan, Carcassonne and Ticket to Ride in one bundle. Everything is complete - cards counted before every loan. Great for long weekends.",
                ItemCondition.LIKE_NEW, "Mylapore, Chennai", 0, "boardgame", A);
        item("vacuum", "suresh", "home", "Bagless Vacuum Cleaner",
                "Strong-suction bagless vacuum with crevice tool and brush heads. Handy for deep-cleaning before festivals like Diwali or Pongal.",
                ItemCondition.FAIR, "Guindy, Chennai", 40, "vacuum", A);
        item("speaker", "ananya", "electronics", "Portable Bluetooth Party Speaker",
                "Loud and bassy, 12-hour battery, water-resistant. Terrace birthdays and beach picnics approved.",
                ItemCondition.GOOD, "Sholinganallur, OMR, Chennai", 120, "speaker", A);
        item("suitcase", "fatima", "travel", "Hard-Shell Cabin Suitcase (55 cm)",
                "Lightweight cabin-size hard-shell trolley with TSA lock and 360-degree wheels. Ideal for short trips and weekend getaways.",
                ItemCondition.LIKE_NEW, "Tambaram, Chennai", 0, "suitcase", A);
        item("sewing", "priya", "home", "Tabletop Sewing Machine",
                "Beginner-friendly electric sewing machine with 12 stitch patterns, spare needles and bobbins. Perfect for fixing curtains, hemming and tailoring experiments.",
                ItemCondition.GOOD, "T. Nagar, Chennai", 60, "sewing", A);
        item("garden", "suresh", "home", "Garden Tool Kit (Spade, Rake, Pruner)",
                "Complete garden set - spade, hand fork, rake, pruning shears and gloves. Great for terrace gardening and repotting.",
                ItemCondition.GOOD, "Guindy, Chennai", 0, "garden", A);
        item("books", "vikram", "games", "Competitive Exam Prep Book Set",
                "Eight well-kept reference books for competitive exam preparation, lightly highlighted. Borrow for a month and save a few thousand rupees.",
                ItemCondition.GOOD, "Chromepet, Chennai", 0, "books", A);
        item("pressure", "priya", "kitchen", "5-Litre Stainless Steel Pressure Cooker",
                "Big family-size cooker, ideal when you're hosting. Fresh gasket fitted. Free to borrow.",
                ItemCondition.GOOD, "T. Nagar, Chennai", 0, "pressure", A);
        item("yoga", "meera", "sports", "Premium Yoga Mat & Block Set",
                "Extra-thick non-slip yoga mat with two blocks and a strap. Perfect for trying yoga before committing.",
                ItemCondition.LIKE_NEW, "Adyar, Chennai", 0, "yoga", ItemStatus.AVAILABLE);
    }

    private void req(String item, String borrower, int startOffset, int endOffset, String msg, RequestStatus status,
                     int createdDaysAgo) {
        BorrowRequest r = new BorrowRequest();
        r.setItem(it.get(item));
        r.setBorrower(u.get(borrower));
        r.setStartDate(LocalDate.now().plusDays(startOffset));
        r.setEndDate(LocalDate.now().plusDays(endOffset));
        r.setMessage(msg);
        r.setStatus(status);
        r.setCreatedAt(LocalDateTime.now().minusDays(createdDaysAgo));
        requests.save(r);
    }

    private void seedRequests() {
        // Pending
        req("camera", "priya", 5, 7, "Need it for my cousin's engagement this weekend. Will take great care!", RequestStatus.PENDING, 1);
        req("drill", "karthik", 2, 3, "Putting up shelves in my new flat in Anna Nagar.", RequestStatus.PENDING, 0);
        req("projector", "rohit", 9, 10, "Planning a cricket screening for friends.", RequestStatus.PENDING, 2);
        // Approved (future)
        req("tent", "karthik", 12, 15, "Trip to Yelagiri with college friends.", RequestStatus.APPROVED, 3);
        req("guitar", "divya", 4, 8, "Want to practise before buying my own.", RequestStatus.APPROVED, 2);
        // Active (currently out)
        req("bike", "ananya", -2, 3, "Morning rides along ECR.", RequestStatus.ACTIVE, 5);
        it.get("bike").setStatus(ItemStatus.BORROWED);
        items.save(it.get("bike"));
        req("mixer", "karthik", -1, 2, "Baking my mother's birthday cake.", RequestStatus.ACTIVE, 4);
        it.get("mixer").setStatus(ItemStatus.BORROWED);
        items.save(it.get("mixer"));
        // Rejected
        req("suitcase", "arjun", 1, 4, "Going to Bengaluru for work.", RequestStatus.REJECTED, 6);
        req("speaker", "vikram", 3, 4, "Terrace party.", RequestStatus.REJECTED, 5);
        // Returned / completed
        req("ladder", "karthik", -20, -18, "Changing ceiling lights.", RequestStatus.RETURNED, 22);
        req("boardgame", "priya", -15, -10, "Family game night.", RequestStatus.RETURNED, 17);
        req("garden", "ananya", -12, -8, "Repotting my terrace plants.", RequestStatus.RETURNED, 14);
        req("vacuum", "rohit", -30, -27, "Pre-Diwali cleaning.", RequestStatus.RETURNED, 32);
        req("books", "arjun", -40, -10, "Preparing for exams.", RequestStatus.RETURNED, 42);
        req("camera", "fatima", -25, -22, "Mahabalipuram photoshoot.", RequestStatus.RETURNED, 27);
        // Cancelled
        req("sewing", "divya", 6, 7, "Hemming curtains.", RequestStatus.CANCELLED, 3);
    }
}
