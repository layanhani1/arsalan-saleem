const menuToggle = document.querySelector('.menu-toggle');
const mainNavigation = document.querySelector('.main-nav');

if (menuToggle && mainNavigation) {

    function openMenu() {
        mainNavigation.classList.add('is-open');

        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Close navigation menu');

        document.body.classList.add('menu-open');
    }

    function closeMenu() {
        mainNavigation.classList.remove('is-open');

        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation menu');

        document.body.classList.remove('menu-open');
    }

    menuToggle.addEventListener('click', () => {

        const isOpen =
            menuToggle.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }

    });

    // Close the menu after selecting a link.
    mainNavigation.querySelectorAll('a').forEach((link) => {

        link.addEventListener('click', closeMenu);

    });

    // Close the menu when Escape is pressed.
    document.addEventListener('keydown', (event) => {

        if (event.key === 'Escape') {
            closeMenu();
        }

    });

    // Close the menu when clicking outside it.
    document.addEventListener('click', (event) => {

        const clickedInsideNavigation =
            mainNavigation.contains(event.target);

        const clickedToggle =
            menuToggle.contains(event.target);

        if (!clickedInsideNavigation && !clickedToggle) {
            closeMenu();
        }

    });

    // Reset mobile navigation when returning to desktop.
    window.addEventListener('resize', () => {

        if (window.innerWidth > 760) {
            closeMenu();
        }

    });

}
/* =========================================
   HOMEPAGE — SCROLL INTERACTIONS
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const homePage = document.querySelector(".home-page");

    if (!homePage) return;

    // Smooth scroll for internal links
    const internalLinks = document.querySelectorAll(
        'a[href^="#"]'
    );

    internalLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    // Reveal sections when they enter the viewport
    const revealElements = document.querySelectorAll(
        ".guide-intro, .discover-section, .closing-section"
    );

    // Avoid hiding content if IntersectionObserver is unavailable
    if (!("IntersectionObserver" in window)) return;

    revealElements.forEach((element) => {
        element.classList.add("reveal-on-scroll");
    });

    homePage.classList.add("reveal-ready");

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");

                observer.unobserve(entry.target);

            });

        },
        {
            threshold: 0.12
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });

});
/* =====================================
   GUEST GALLERY - HORIZONTAL + LIGHTBOX
===================================== */
/* =====================================
   GUEST GALLERY - HORIZONTAL + LIGHTBOX
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const gallery = document.getElementById("guest-gallery-track");
    const lightbox = document.getElementById("guest-lightbox");

    if (!gallery || !lightbox) return;

    const photos = Array.from(
        gallery.querySelectorAll(".guest-photo")
    );

    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const counter = document.getElementById("lightbox-counter");

    const closeButton = lightbox.querySelector(".lightbox-close");
    const prevButton = lightbox.querySelector(".lightbox-prev");
    const nextButton = lightbox.querySelector(".lightbox-next");

    let currentIndex = 0;
    let lastFocusedElement = null;

    function showPhoto(index) {

        currentIndex = (index + photos.length) % photos.length;

        const image = photos[currentIndex].querySelector("img");

        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;

        lightboxCaption.textContent = image.alt;

        counter.textContent =
            `${currentIndex + 1} / ${photos.length}`;
    }

    function openLightbox(index) {

        lastFocusedElement = document.activeElement;

        showPhoto(index);

        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        closeButton.focus();
    }

    function closeLightbox() {

        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    photos.forEach((photo, index) => {

        photo.addEventListener("click", () => {
            openLightbox(index);
        });

    });

    closeButton.addEventListener("click", closeLightbox);

    nextButton.addEventListener("click", () => {
        showPhoto(currentIndex + 1);
    });

    prevButton.addEventListener("click", () => {
        showPhoto(currentIndex - 1);
    });

    lightbox.addEventListener("click", (event) => {

        if (event.target === lightbox) {
            closeLightbox();
        }

    });

    document.addEventListener("keydown", (event) => {

        if (!lightbox.classList.contains("active")) return;

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowRight") {
            showPhoto(currentIndex + 1);
        }

        if (event.key === "ArrowLeft") {
            showPhoto(currentIndex - 1);
        }

    });

});
/* ==========================================
   PETRA PAGE — CAROUSELS & DETAIL MODALS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const petraPage = document.querySelector(".petra-page");

    // This script is shared through main.js.
    // Exit quietly on pages that are not the Petra page.
    if (!petraPage) return;


    /* ======================================
       CAROUSEL HELPERS
    ====================================== */

    function setupCarousel({
        trackId,
        previousId,
        nextId,
        counterId,
        cardSelector
    }) {
        const track = document.getElementById(trackId);
        const previousButton = document.getElementById(previousId);
        const nextButton = document.getElementById(nextId);
        const counter = document.getElementById(counterId);

        if (!track || !previousButton || !nextButton) return;

        const getCards = () => Array.from(
            track.querySelectorAll(cardSelector)
        );

        function getStep() {
            const firstCard = getCards()[0];

            if (!firstCard) return 280;

            const styles = getComputedStyle(track);
            const gap = parseFloat(styles.columnGap) || 0;

            return firstCard.getBoundingClientRect().width + gap;
        }

        function updateCounter() {
            if (!counter) return;

            const cards = getCards();

            if (!cards.length) return;

            const step = getStep();
            const index = Math.round(track.scrollLeft / step);

            counter.textContent = String(
                Math.min(index + 1, cards.length)
            ).padStart(2, "0");
        }

        previousButton.addEventListener("click", () => {
            track.scrollBy({
                left: -getStep(),
                behavior: "smooth"
            });
        });

        nextButton.addEventListener("click", () => {
            const step = getStep();

            const atEnd =
                track.scrollLeft + track.clientWidth >=
                track.scrollWidth - 5;

            if (atEnd) {
                track.scrollTo({
                    left: 0,
                    behavior: "smooth"
                });
            } else {
                track.scrollBy({
                    left: step,
                    behavior: "smooth"
                });
            }
        });

        track.addEventListener("scroll", updateCounter, {
            passive: true
        });

        window.addEventListener("resize", updateCounter);

        updateCounter();
    }


    setupCarousel({
        trackId: "landmarks-track",
        previousId: "landmark-prev",
        nextId: "landmark-next",
        counterId: "landmark-current",
        cardSelector: ".landmark-card"
    });

    setupCarousel({
        trackId: "trails-track",
        previousId: "trail-prev",
        nextId: "trail-next",
        counterId: "trail-current",
        cardSelector: ".trail-card"
    });


    /* ======================================
       MODAL DATA
    ====================================== */

    const landmarkDetails = {

        "siq": {
            title: "The Siq",
            category: "THE DRAMATIC ENTRANCE",
            image: "",
            description: "The Siq is the narrow natural gorge that forms the dramatic approach to Petra's ancient city. Towering sandstone walls, geological formations, and traces of Nabataean water engineering make the walk part of the experience itself.",
            facts: [
                ["Location", "Main entrance to Petra"],
                ["Best for", "First-time visitors and photography"],
                ["Terrain", "Rocky, mostly gradual walking"],
                ["Allow", "Time to explore the entrance route"]
            ],
            note: "The Siq is part of the Main Trail. Walking conditions and access may vary."
        },

        "treasury": {
            title: "The Treasury",
            category: "PETRA'S ICONIC LANDMARK",
            image: "https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=1200&q=85",
            description: "Al-Khazneh, commonly known as the Treasury, is Petra's best-known facade. Carved into rose-coloured sandstone, it rewards visitors who take time to appreciate its details, scale, and dramatic setting at the end of the Siq.",
            facts: [
                ["Location", "At the end of the Siq"],
                ["Best for", "Architecture and photography"],
                ["Access", "Via the Main Trail"],
                ["Allow", "Time to view and appreciate the facade"]
            ],
            note: "Access to elevated viewpoints follows separate routes and may involve steep or uneven terrain."
        },

        "facades": {
            title: "Street of Facades",
            category: "ROCK-CUT HERITAGE",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85",
            description: "The Street of Facades features a series of rock-cut tomb fronts and chambers carved into the sandstone cliffs. It offers a closer look at the architectural landscape that continues beyond the Treasury.",
            facts: [
                ["Location", "Along the Main Trail"],
                ["Best for", "History and architecture"],
                ["Terrain", "Uneven archaeological paths"],
                ["Access", "Walk from the Treasury area"]
            ],
            note: "Please avoid climbing on fragile archaeological structures."
        },

        "theatre": {
            title: "The Theatre",
            category: "ANCIENT NABATAEAN CITY",
            image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=85",
            description: "Petra's Theatre was carved into the sandstone and later modified during the city's Roman period. Its scale offers a fascinating glimpse into public life in the ancient city.",
            facts: [
                ["Location", "Along the Main Trail"],
                ["Best for", "Architecture and ancient history"],
                ["Terrain", "Uneven stone paths"],
                ["Access", "Visible from the main route"]
            ],
            note: "Follow the site's marked visitor routes and barriers."
        },

        "royal-tombs": {
            title: "The Royal Tombs",
            category: "MONUMENTAL TOMBS",
            image: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&w=1200&q=85",
            description: "The Royal Tombs are a striking group of monumental facades set into the eastern cliffs. Their distinctive forms and changing sandstone colours make this one of Petra's most memorable architectural areas.",
            facts: [
                ["Location", "Eastern cliffs of Petra"],
                ["Best for", "Architecture and photography"],
                ["Terrain", "Uneven paths and steps"],
                ["Allow", "Additional time beyond the Treasury"]
            ],
            note: "The Al-Khubtha route continues uphill beyond this area."
        },

        "colonnaded-street": {
            title: "Colonnaded Street",
            category: "THE ANCIENT CITY CENTRE",
            image: "https://images.unsplash.com/photo-1590736969955-2083093ee35b?auto=format&fit=crop&w=1200&q=85",
            description: "Colonnaded Street forms part of Petra's urban centre. Its surviving architectural remains help visitors imagine the civic and commercial activity that once connected different parts of the ancient city.",
            facts: [
                ["Location", "Central Petra"],
                ["Best for", "Archaeology and urban history"],
                ["Terrain", "Open archaeological paths"],
                ["Access", "Along the Main Trail"]
            ],
            note: "The exact route and accessible areas depend on current site conditions."
        },

        "great-temple": {
            title: "The Great Temple",
            category: "MONUMENTAL NABATAEAN COMPLEX",
            image: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=1200&q=85",
            description: "The Great Temple complex is among Petra's major archaeological discoveries. Its monumental remains and architectural layout provide important clues about the ancient city's development and public spaces.",
            facts: [
                ["Location", "Central Petra"],
                ["Best for", "Archaeology and history"],
                ["Terrain", "Uneven ruins and paths"],
                ["Access", "Near Colonnaded Street"]
            ],
            note: "Interpretations of the complex continue to develop with archaeological research."
        },

        "qasr-al-bint": {
            title: "Qasr al-Bint",
            category: "A MAJOR ANCIENT TEMPLE",
            image: "https://images.unsplash.com/photo-1605106702734-205df224ecce?auto=format&fit=crop&w=1200&q=85",
            description: "Qasr al-Bint is one of Petra's most important freestanding temple structures. Located near the ancient city's central area, it offers a striking contrast to the tomb facades carved directly into rock.",
            facts: [
                ["Location", "Central Petra"],
                ["Best for", "Ancient religion and architecture"],
                ["Terrain", "Open archaeological paths"],
                ["Access", "Near the end of the Main Trail"]
            ],
            note: "Observe all preservation barriers and posted restrictions."
        },

        "monastery": {
            title: "The Monastery",
            category: "THE GREAT MOUNTAIN ASCENT",
            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
            description: "Ad-Deir, known as the Monastery, is a monumental rock-cut facade reached by a demanding ascent. Its scale and mountain setting make it one of Petra's most memorable destinations.",
            facts: [
                ["Location", "Beyond the central city"],
                ["Best for", "Hiking and monumental architecture"],
                ["Terrain", "Long stair climb and uneven ground"],
                ["Allow", "Extra time for the ascent and return"]
            ],
            note: "The climb can be strenuous. Bring water and check local conditions before setting out."
        },

        "high-place": {
            title: "High Place of Sacrifice",
            category: "HISTORIC RITUAL SITE",
            image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
            description: "This elevated archaeological site occupies a mountain ridge above Petra. The route combines an uphill walk with broad views over the sandstone landscape and ancient city.",
            facts: [
                ["Location", "Above central Petra"],
                ["Best for", "Hiking and panoramic views"],
                ["Terrain", "Steep and uneven sections"],
                ["Allow", "Time for the climb and return"]
            ],
            note: "Use appropriate footwear and follow locally recommended routes."
        },

        "little-petra": {
            title: "Little Petra",
            category: "BEIDA / SIQ AL-BARID",
            image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=85",
            description: "Little Petra, also known as Siq al-Barid, is a nearby archaeological site with its own narrow passage, rock-cut spaces, and traces of Nabataean life. It makes a worthwhile addition to a wider visit to the region.",
            facts: [
                ["Location", "Near Beidha, north of Petra"],
                ["Best for", "Archaeology and a quieter visit"],
                ["Terrain", "Uneven paths and rock-cut areas"],
                ["Plan", "Check transport and access separately"]
            ],
            note: "Little Petra is a separate site from the main Petra archaeological entrance."
        }

    };


    const trailDetails = {

        "main-trail": {
            title: "The Main Trail",
            category: "THE CLASSIC PETRA ROUTE",
            image: "https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=1200&q=85",
            description: "The Main Trail begins at the Petra Visitor Centre and continues through the Siq to the Treasury, past major monuments and the central archaeological area, ending near Qasr al-Bint.",
            facts: [
                ["Distance", "3.9 km one way"],
                ["Official duration", "1 h 30 min–1 h 45 min non-stop"],
                ["Grade", "Easy"],
                ["Best for", "First-time visitors"]
            ],
            note: "These are official trail figures. Most visitors spend longer exploring the monuments and taking breaks."
        },

        "khubtha": {
            title: "Al-Khubtha Trail",
            category: "ELEVATED TREASURY VIEWPOINT",
            image: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&w=1200&q=85",
            description: "The Al-Khubtha route passes the Street of Facades, Theatre, and Royal Tombs before climbing towards an elevated viewpoint overlooking the Treasury.",
            facts: [
                ["Starting area", "Royal Tombs"],
                ["Duration", "Often around 2–2.5 h for the route segment"],
                ["Grade", "Hard"],
                ["Best for", "Hikers and panoramic photography"]
            ],
            note: "The total time depends on your starting point. Confirm current access and conditions locally."
        },

        "sacrifice-trail": {
            title: "High Place of Sacrifice Trail",
            category: "HISTORIC HILLTOP ROUTE",
            image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
            description: "This uphill route leads from the central archaeological area to a historic ritual site above Petra. Longer variants continue through Wadi Farasa and other monuments.",
            facts: [
                ["Starting area", "Theatre area"],
                ["Duration", "Varies by route and return option"],
                ["Grade", "Uphill, uneven terrain"],
                ["Best for", "Hikers and wide views"]
            ],
            note: "Choose the correct route with local guidance, particularly if continuing through Wadi Farasa."
        },

        "madras": {
            title: "Al-Madras Trail",
            category: "ARCHAEOLOGY AND VIEWS",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85",
            description: "Official Petra trail material lists Al-Madras routes connecting the Visitor Centre area with archaeological features and elevated views. Longer variants continue towards Wadi Farasa and Qasr al-Bint.",
            facts: [
                ["Starting area", "Visitor Centre area"],
                ["Duration", "About 3 h for one listed variant"],
                ["Grade", "Route-dependent"],
                ["Best for", "Repeat visitors and hikers"]
            ],
            note: "The official trail guide distinguishes Al-Madras 1 and Al-Madras 2. Confirm which route is available."
        },

        "deir": {
            title: "Al-Deir Monastery Trail",
            category: "THE MONASTERY ASCENT",
            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
            description: "This route leads towards Ad-Deir, the Monastery, via a long climb with many steps. Visitors are rewarded with one of Petra's largest and most striking rock-cut monuments.",
            facts: [
                ["Destination", "Ad-Deir / The Monastery"],
                ["Duration", "Depends on starting point and pace"],
                ["Grade", "Moderate to strenuous"],
                ["Best for", "Visitors comfortable with a long climb"]
            ],
            note: "Allow time for the return journey. The direct and back routes are different trails."
        },

        "back-route": {
            title: "Back Route to the Monastery",
            category: "THE MOUNTAIN APPROACH",
            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
            description: "The back approach generally refers to routes from the Beidha or Little Petra area towards the Monastery through higher terrain. Some itineraries continue down into the central site.",
            facts: [
                ["Starting area", "Beidha / Little Petra area"],
                ["Duration", "Often 6–8 h for longer itineraries"],
                ["Grade", "Route-dependent; can be strenuous"],
                ["Best for", "Experienced walkers with local guidance"]
            ],
            note: "You listed 'axe trail to monastery'. I have interpreted this as the back route to the Monastery; confirm the exact local trail name before publishing."
        },

        "little-petra-trail": {
            title: "Little Petra Trail",
            category: "SIQ AL-BARID",
            image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=85",
            description: "Explore the narrow passage and archaeological remains at Little Petra. Some listed itineraries continue towards nearby farming areas.",
            facts: [
                ["Starting area", "Little Petra / Siq al-Barid"],
                ["Duration", "About 3 h for one listed itinerary"],
                ["Grade", "Depends on the chosen route"],
                ["Best for", "Archaeology and quieter exploration"]
            ],
            note: "Little Petra is outside the main Petra site. Verify transportation and entry arrangements."
        },

        "biyara": {
            title: "Umm al-Biyara Trail",
            category: "A DEMANDING MOUNTAIN ASCENT",
            image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
            description: "Umm al-Biyara is a prominent mountain overlooking Petra. Reaching its upper area involves a demanding ascent and is best planned with someone familiar with the route.",
            facts: [
                ["Starting area", "Near Qasr al-Bint"],
                ["Duration", "Often 6–8 h in older route listings"],
                ["Grade", "Difficult"],
                ["Best for", "Experienced hikers"]
            ],
            note: "Check route availability, permissions, and safety with local authorities or a licensed guide."
        },

        "haroun": {
            title: "Jabal Haroun Trail",
            category: "LONG-DISTANCE HERITAGE ROUTE",
            image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
            description: "This longer mountain route heads towards the area traditionally associated with the tomb of Aaron. It involves a substantial walk through rugged terrain and should not be treated as a casual short hike.",
            facts: [
                ["Destination", "Jabal Haroun area"],
                ["Distance", "Official listings include routes of several kilometres"],
                ["Grade", "Moderate to difficult"],
                ["Best for", "Experienced walkers with local guidance"]
            ],
            note: "Confirm access, route conditions, weather, and required arrangements before attempting the hike."
        },

        "sabra": {
            title: "Wadi Sabra Trail",
            category: "THE WIDER PETRA LANDSCAPE",
            image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=85",
            description: "Wadi Sabra is a longer route beyond Petra's central monuments, offering a different landscape and archaeological setting. It requires more planning than the Main Trail.",
            facts: [
                ["Starting area", "Petra Visitor Centre area in listed itineraries"],
                ["Duration", "Around 8 h in an official route listing"],
                ["Grade", "Moderate in the official trail list"],
                ["Best for", "Full-day exploration"]
            ],
            note: "Confirm the exact route, availability, and whether a guide is required."
        }

    };
/* ==========================================
   PETRA EXPERIENCES — CATEGORY FILTERS
========================================== */
/* =====================================
   EXPERIENCES V2 — MODAL
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const grid = document.getElementById("experiencesGrid");
    const modal = document.getElementById("experienceModal");

    if (!grid || !modal || grid.dataset.initialized === "true") {
        return;
    }

    grid.dataset.initialized = "true";

    const closeButton = document.getElementById("closeExperienceModal");

    const iconElement = document.getElementById("modalExperienceIcon");
    const numberElement = document.getElementById("modalExperienceNumber");
    const titleElement = document.getElementById("modalExperienceTitle");
    const descriptionElement = document.getElementById("modalExperienceDescription");

    const experiences = [
        {
            title: "Sunrise Tour",
            icon: "🌅",
            description: "Discover the beauty of Petra in the peaceful morning light."
        },
        {
            title: "Sunset Tour",
            icon: "🌄",
            description: "Enjoy breathtaking sunset views across Petra's landscapes."
        },
        {
            title: "Horse Tour",
            icon: "🐎",
            description: "Experience a traditional horseback journey through Petra."
        },
        {
            title: "Buggy Ride",
            icon: "🏎️",
            description: "Enjoy an exciting buggy adventure through selected desert areas."
        },
        {
            title: "Camel Tour",
            icon: "🐪",
            description: "Discover the traditional way of exploring the desert on camelback."
        },
        {
            title: "Jeep Tour",
            icon: "🚙",
            description: "Explore Jordan's desert landscapes on a guided jeep adventure."
        },
        {
            title: "City Tour",
            icon: "🏛️",
            description: "Explore local landmarks, history and culture with your guide."
        },
        {
            title: "Desert Tour",
            icon: "🏜️",
            description: "Experience the beauty and peaceful atmosphere of Jordan's desert."
        },
        {
            title: "Hiking",
            icon: "🥾",
            description: "Explore scenic trails and discover Petra's natural beauty."
        },
        {
            title: "Camping",
            icon: "⛺",
            description: "Enjoy an outdoor experience under the Jordanian desert sky."
        },
        {
            title: "Stargazing",
            icon: "✨",
            description: "Spend an unforgettable evening watching the stars."
        },
        {
            title: "Local Events",
            icon: "🎭",
            description: "Discover local celebrations and cultural experiences."
        },
        {
            title: "Photography",
            icon: "📸",
            description: "Capture memorable moments and beautiful landscapes."
        },
        {
            title: "Petra by Night",
            icon: "🌙",
            description: "Experience Petra's magical atmosphere after sunset."
        },
        {
            title: "Bedouin Culture",
            icon: "🍵",
            description: "Discover Bedouin hospitality, traditions and local heritage."
        },
        {
            title: "Local Cuisine",
            icon: "🍽️",
            description: "Discover Jordanian food and traditional local flavors."
        }
    ];

    function openModal(index) {

        const experience = experiences[index];

        if (!experience) return;

        iconElement.textContent = experience.icon;
        numberElement.textContent =
            `EXPERIENCE ${String(index + 1).padStart(2, "0")}`;

        titleElement.textContent = experience.title;
        descriptionElement.textContent = experience.description;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        closeButton.focus();
    }

    function closeModal() {

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";
    }

    grid.addEventListener("click", (event) => {

        const tile = event.target.closest(".experience-tile");

        if (!tile) return;

        openModal(Number(tile.dataset.index));

    });

    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {

        if (event.target === modal) {
            closeModal();
        }

    });

    document.addEventListener("keydown", (event) => {

        if (!modal.classList.contains("active")) return;

        if (event.key === "Escape") {
            closeModal();
        }

    });

});
    /* ======================================
       MODAL ELEMENTS AND HELPERS
    ====================================== */

    const modal = document.getElementById("petra-detail-modal");

    if (!modal) return;

    const modalPanel = modal.querySelector(".petra-modal-panel");
    const modalImage = document.getElementById("petra-modal-image");
    const modalCategory = document.getElementById("petra-modal-category");
    const modalTitle = document.getElementById("petra-modal-title");
    const modalDescription = document.getElementById("petra-modal-description");
    const modalFacts = document.getElementById("petra-modal-facts");
    const modalNote = document.getElementById("petra-modal-note");

    let previousFocus = null;


    function openDetail(data) {
        if (!data) return;

        previousFocus = document.activeElement;
modalImage.removeAttribute("src");
modalImage.removeAttribute("alt");
modalImage.style.display = "none";

        modalCategory.textContent = data.category;
        modalTitle.textContent = data.title;
        modalDescription.textContent = data.description;
        modalNote.textContent = data.note || "";

        modalFacts.replaceChildren();

        data.facts.forEach(([label, value]) => {
            const fact = document.createElement("div");
            fact.className = "petra-modal-fact";

            const labelElement = document.createElement("span");
            labelElement.textContent = label;

            const valueElement = document.createElement("strong");
            valueElement.textContent = value;

            fact.append(labelElement, valueElement);
            modalFacts.appendChild(fact);
        });

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        modalPanel.focus();
    }


    function closeDetail() {
        if (!modal.classList.contains("is-open")) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        modalImage.removeAttribute("src");

        if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }
    }


    /* ======================================
       LANDMARK DETAILS
    ====================================== */

    petraPage.querySelectorAll("[data-detail]").forEach(button => {
        button.addEventListener("click", () => {
            const key = button.dataset.detail;
            openDetail(landmarkDetails[key]);
        });
    });


    /* ======================================
       TRAIL DETAILS
    ====================================== */

    petraPage.querySelectorAll("[data-trail]").forEach(button => {
        button.addEventListener("click", () => {
            const key = button.dataset.trail;
            openDetail(trailDetails[key]);
        });
    });


    /* ======================================
       EXPERIENCE DETAILS
    ====================================== */

    petraPage.querySelectorAll("[data-experience]").forEach(button => {
        button.addEventListener("click", () => {
            const key = button.dataset.experience;
            openDetail(experienceDetails[key]);
        });
    });


    /* ======================================
       MODAL CLOSE EVENTS
    ====================================== */

    modal.querySelectorAll("[data-modal-close]").forEach(element => {
        element.addEventListener("click", closeDetail);
    });

    document.addEventListener("keydown", event => {
        if (!modal.classList.contains("is-open")) return;

        if (event.key === "Escape") {
            closeDetail();
        }
    });

});
/* =====================================================
   AROUND JORDAN — INTERACTIVE MAP + DESTINATION CAROUSEL
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".around-jordan-page");

  if (!page) return;

  /* ==========================================
     DESTINATION DATA
  ========================================== */

  const destinations = {
    "umm-qais": {
      title: "Umm Qais",
      region: "THE NORTH",
      description:
        "Explore ancient Gadara and enjoy sweeping views over the northern valleys and surrounding waters.",
      index: "DESTINATION 01"
    },

    jerash: {
      title: "Jerash",
      region: "THE NORTH",
      description:
        "Walk through remarkable Roman streets, plazas, temples, and archaeological remains.",
      index: "DESTINATION 02"
    },

    ajloun: {
      title: "Ajloun",
      region: "THE NORTH",
      description:
        "Discover forest landscapes, hiking opportunities, and the historic Ajloun Castle.",
      index: "DESTINATION 03"
    },

    amman: {
      title: "Amman",
      region: "CENTRAL JORDAN",
      description:
        "Experience the capital's ancient landmarks, traditional markets, cafés, and contemporary culture.",
      index: "DESTINATION 04"
    },

    salt: {
      title: "As-Salt",
      region: "CENTRAL JORDAN",
      description:
        "Explore historic streets, heritage houses, and the cultural character of this historic town.",
      index: "DESTINATION 05"
    },

    madaba: {
      title: "Madaba",
      region: "CENTRAL JORDAN",
      description:
        "Discover historic mosaics, religious heritage, and centuries of artistic tradition.",
      index: "DESTINATION 06"
    },

    "mount-nebo": {
      title: "Mount Nebo",
      region: "CENTRAL JORDAN",
      description:
        "Visit a significant religious landmark and take in the surrounding panoramic views.",
      index: "DESTINATION 07"
    },

    "dead-sea": {
      title: "The Dead Sea",
      region: "THE JORDAN VALLEY",
      description:
        "Experience salt-rich waters, mineral mud, and extraordinary scenery at one of the region's most distinctive natural landmarks.",
      index: "DESTINATION 08"
    },

    "wadi-mujib": {
      title: "Wadi Mujib",
      region: "CENTRAL JORDAN",
      description:
        "Discover dramatic canyon scenery and seasonal outdoor adventures where routes are open.",
      index: "DESTINATION 09"
    },

    karak: {
      title: "Karak",
      region: "THE KING'S HIGHWAY",
      description:
        "Explore a medieval castle and the history of the historic routes crossing southern Jordan.",
      index: "DESTINATION 10"
    },

    dana: {
      title: "Dana & Feynan",
      region: "THE SOUTH",
      description:
        "Explore mountain landscapes, valleys, biodiversity, and hiking routes in a remarkable nature reserve.",
      index: "DESTINATION 11"
    },

    shobak: {
      title: "Shobak Castle",
      region: "THE SOUTH",
      description:
        "Discover a historic fortress surrounded by the rugged landscapes of southern Jordan.",
      index: "DESTINATION 12"
    },

    petra: {
      title: "Petra",
      region: "SOUTHERN JORDAN",
      description:
        "Walk through the Siq, admire the Treasury, and discover the extraordinary ancient Nabataean city.",
      index: "DESTINATION 13"
    },

    "wadi-rum": {
      title: "Wadi Rum",
      region: "SOUTHERN JORDAN",
      description:
        "Explore sandstone mountains, desert adventures, Bedouin hospitality, and unforgettable night skies.",
      index: "DESTINATION 14"
    },

    aqaba: {
      title: "Aqaba",
      region: "THE FAR SOUTH",
      description:
        "Discover the Red Sea through coastal scenery, marine activities, boat trips, and relaxed seaside experiences.",
      index: "DESTINATION 15"
    }
  };

/* ==========================================
   AROUND JORDAN — GEOGRAPHIC DESTINATION MAP
   Requires Leaflet 1.9.4
   ========================================== */

(() => {
  const mapElement = document.getElementById("jordan-real-map");

  if (!mapElement || typeof L === "undefined") {
    return;
  }

  // Prevent duplicate initialization.
  if (mapElement.dataset.mapInitialized === "true") {
    return;
  }

  mapElement.dataset.mapInitialized = "true";

  const destinations = [
    {
      id: "umm-qais",
      name: "Umm Qais",
      region: "NORTHERN JORDAN",
      lat: 32.6536,
      lng: 35.6846,
      description:
        "Discover ancient Gadara, archaeological ruins, and sweeping views across the northern Jordan Valley.",
      url: "#jordan-destinations"
    },
    {
      id: "jerash",
      name: "Jerash",
      region: "NORTHERN JORDAN",
      lat: 32.2808,
      lng: 35.8993,
      description:
        "Walk through one of the region's remarkable Roman archaeological cities.",
      url: "#jordan-destinations"
    },
    {
      id: "ajloun",
      name: "Ajloun",
      region: "NORTHERN JORDAN",
      lat: 32.3333,
      lng: 35.7528,
      description:
        "Explore green hills, woodland landscapes, and the historic Ajloun Castle.",
      url: "#jordan-destinations"
    },
    {
      id: "amman",
      name: "Amman",
      region: "CENTRAL JORDAN",
      lat: 31.9539,
      lng: 35.9106,
      description:
        "Experience Jordan's capital, where historic landmarks meet modern city life.",
      url: "#jordan-destinations"
    },
    {
      id: "as-salt",
      name: "As-Salt",
      region: "CENTRAL JORDAN",
      lat: 32.0392,
      lng: 35.7272,
      description:
        "Discover historic streets, traditional architecture, and the city's cultural heritage.",
      url: "#jordan-destinations"
    },
    {
      id: "madaba",
      name: "Madaba",
      region: "CENTRAL JORDAN",
      lat: 31.7195,
      lng: 35.7939,
      description:
        "Explore the city's celebrated mosaics and historic religious landmarks.",
      url: "#jordan-destinations"
    },
    {
      id: "mount-nebo",
      name: "Mount Nebo",
      region: "CENTRAL JORDAN",
      lat: 31.7683,
      lng: 35.7256,
      description:
        "Visit a historic hilltop known for its panoramic views of the Jordan Valley.",
      url: "#jordan-destinations"
    },
    {
      id: "dead-sea",
      name: "Dead Sea",
      region: "JORDAN VALLEY",
      lat: 31.5590,
      lng: 35.4732,
      description:
        "Experience the extraordinary landscape and mineral-rich waters of the Dead Sea.",
      url: "#jordan-destinations"
    },
    {
      id: "wadi-mujib",
      name: "Wadi Mujib",
      region: "JORDAN VALLEY",
      lat: 31.4610,
      lng: 35.5730,
      description:
        "Discover dramatic canyon scenery and seasonal outdoor adventures. Check access conditions before visiting.",
      url: "#jordan-destinations"
    },
    {
      id: "karak",
      name: "Karak",
      region: "SOUTHERN JORDAN",
      lat: 31.1800,
      lng: 35.7048,
      description:
        "Explore Karak Castle and the historic landscapes of Jordan's central highlands.",
      url: "#jordan-destinations"
    },
    {
      id: "dana",
      name: "Dana",
      region: "SOUTHERN JORDAN",
      lat: 30.6750,
      lng: 35.6100,
      description:
        "Discover a remarkable nature reserve with mountain scenery and walking trails.",
      url: "#jordan-destinations"
    },
    {
      id: "shobak",
      name: "Shobak",
      region: "SOUTHERN JORDAN",
      lat: 30.5220,
      lng: 35.5600,
      description:
        "Visit the historic Crusader castle surrounded by rugged southern landscapes.",
      url: "#jordan-destinations"
    },
    {
      id: "petra",
      name: "Petra",
      region: "SOUTHERN JORDAN",
      lat: 30.3285,
      lng: 35.4444,
      description:
        "Explore the ancient Nabataean city, its rock-cut monuments, and surrounding trails.",
      url: "/petra"
    },
    {
      id: "wadi-rum",
      name: "Wadi Rum",
      region: "SOUTHERN JORDAN",
      lat: 29.5760,
      lng: 35.4200,
      description:
        "Discover vast desert landscapes, sandstone mountains, and Bedouin cultural experiences.",
      url: "#jordan-destinations"
    },
    {
      id: "aqaba",
      name: "Aqaba",
      region: "RED SEA",
      lat: 29.5267,
      lng: 35.0078,
      description:
        "Enjoy the Red Sea coast, marine life, and the relaxed atmosphere of Jordan's coastal city.",
      url: "#jordan-destinations"
    }
  ];

  const map = L.map(mapElement, {
    zoomControl: true,
    scrollWheelZoom: false,
    preferCanvas: true
  });

  // Actual geographic tiles: no manually drawn country silhouette.
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const bounds = L.latLngBounds(
    destinations.map((destination) => [
      destination.lat,
      destination.lng
    ])
  );

  map.fitBounds(bounds.pad(0.16), {
    animate: false
  });

  const markerElements = new Map();
  const markerLayers = new Map();

  const regionElement = document.getElementById("aj-map-region");
  const titleElement = document.getElementById("aj-map-title");
  const descriptionElement = document.getElementById("aj-map-description");
  const coordinatesElement = document.getElementById("aj-map-coordinates");
  const linkElement = document.getElementById("aj-map-link");

  function selectDestination(destination, shouldZoom = false) {
    if (
      !regionElement ||
      !titleElement ||
      !descriptionElement ||
      !coordinatesElement ||
      !linkElement
    ) {
      return;
    }

    regionElement.textContent = destination.region;

    titleElement.replaceChildren();

    const title = document.createElement("span");
    title.textContent = destination.name;

    const emphasis = document.createElement("em");
    emphasis.textContent = "awaits you.";

    titleElement.append(title, emphasis);

    descriptionElement.textContent = destination.description;

    coordinatesElement.textContent =
      `${destination.lat.toFixed(4)}° N · ` +
      `${destination.lng.toFixed(4)}° E`;

    linkElement.href = destination.url;
    linkElement.replaceChildren();

    const linkText = document.createElement("span");
    linkText.textContent = "EXPLORE DESTINATION";

    const arrow = document.createElement("span");
    arrow.textContent = "↗";
    arrow.setAttribute("aria-hidden", "true");

    linkElement.append(linkText, arrow);

    markerElements.forEach((element, id) => {
      element.classList.toggle("is-selected", id === destination.id);

      const button = element.querySelector("button");
      if (button) {
        button.setAttribute(
          "aria-pressed",
          String(id === destination.id)
        );
      }
    });

    if (shouldZoom) {
      map.flyTo(
        [destination.lat, destination.lng],
        Math.max(map.getZoom(), 9),
        { duration: 0.7 }
      );
    }
  }

  destinations.forEach((destination) => {
    const marker = L.marker(
      [destination.lat, destination.lng],
      {
        title: destination.name,
        keyboard: true,
        riseOnHover: true,
        icon: L.divIcon({
          className: "",
          iconSize: [170, 30],
          iconAnchor: [8, 15],
          html: `
            <button
              type="button"
              class="aj-destination-marker"
              aria-label="Explore ${destination.name}"
              aria-pressed="false"
            >
              <span class="aj-marker-dot"></span>
              <span class="aj-marker-name">${destination.name}</span>
            </button>
          `
        })
      }
    ).addTo(map);

    const element = marker.getElement();

    if (element) {
      const button = element.querySelector("button");

      if (button) {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          selectDestination(destination, true);
        });
      }

      markerElements.set(destination.id, element);
    } else {
      marker.on("click", () => {
        selectDestination(destination, true);
      });
    }

    marker.bindTooltip(destination.name, {
      direction: "top",
      offset: [0, -10]
    });

    markerLayers.set(destination.id, marker);
  });

  // Selecting a destination from an existing destination card.
  document.querySelectorAll("[data-destination]").forEach((element) => {
    element.addEventListener("click", () => {
      const id = element.dataset.destination;

      const destination = destinations.find((item) => {
        return item.id === id || item.name === id;
      });

      if (!destination) return;

      selectDestination(destination, true);
    });
  });

  // Select Petra as the initial featured destination.
  const initialDestination =
    destinations.find((destination) => destination.id === "petra") ||
    destinations[0];

  selectDestination(initialDestination);

  map.whenReady(() => {
    requestAnimationFrame(() => {
      map.invalidateSize();
      map.fitBounds(bounds.pad(0.16), { animate: false });
    });
  });

  window.addEventListener("resize", () => {
    map.invalidateSize();
  });
})();
  /* ==========================================
     DESTINATION CAROUSEL
  ========================================== */

  const track = page.querySelector("#aj-destination-track");
  const previousButton = page.querySelector("#aj-dest-prev");
  const nextButton = page.querySelector("#aj-dest-next");

  function getScrollDistance() {
    if (!track) return 300;

    const card = track.querySelector(".aj-destination-card");

    if (!card) return 300;

    const trackStyle = window.getComputedStyle(track);
    const gap = parseFloat(trackStyle.columnGap) || 0;

    return card.getBoundingClientRect().width + gap;
  }

  function scrollDestinations(direction) {
    if (!track) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    track.scrollBy({
      left: getScrollDistance() * direction,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  }

  previousButton?.addEventListener("click", () => {
    scrollDestinations(-1);
  });

  nextButton?.addEventListener("click", () => {
    scrollDestinations(1);
  });


  /* ==========================================
     DESTINATION LINKS
  ========================================== */

  if (mapLink) {
    mapLink.addEventListener("click", (event) => {
      const href = mapLink.getAttribute("href");

      if (!href || !href.startsWith("#dest-")) return;

      const card = page.querySelector(href);

      if (!card) {
        // The selected destination has no matching card.
        return;
      }

      event.preventDefault();

      card.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches ? "auto" : "smooth",
        block: "nearest",
        inline: "center"
      });
    });
  }


  /* ==========================================
     INITIAL MAP STATE
  ========================================== */

  // Start with the general introduction selected.
  // Visitors can select a marker to explore a place.

  markers.forEach((marker) => {
    marker.setAttribute("aria-pressed", "false");
  });

});
// ========================================
// RECOMMENDATIONS FORM — OPEN AND CLOSE
// ========================================

(() => {
  const page = document.querySelector(".recommendations-page");

  if (!page) return;

  const formSection = page.querySelector(
    "#recommendation-form-section"
  );

  const openButtons = [
    page.querySelector("#open-recommendation-form"),
    page.querySelector("#open-recommendation-form-bottom")
  ];

  openButtons.forEach((button) => {
    if (!button) return;

    button.addEventListener("click", () => {
      formSection.hidden = false;

      formSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      const firstField = formSection.querySelector(
        'input[name="visitor_name"]'
      );

      if (firstField) {
        firstField.focus({ preventScroll: true });
      }
    });
  });
})();
// ========================================
// RECOMMENDATIONS FORM — SUBMISSION
// ========================================

(() => {
  const page = document.querySelector('.recommendations-page');

  if (!page) return;

  const form = page.querySelector('#recommendation-form');
  const message = page.querySelector('#recommendation-form-message');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    message.textContent = '';
    submitButton.disabled = true;

    try {
      const response = await fetch('/recommendations', {
        method: 'POST',
        body: new URLSearchParams(new FormData(form))
      });

      const result = await response.json();

      message.textContent = result.message;

      if (response.ok && result.success) {
        form.reset();
      }

    } catch (error) {
      console.error('Submission error:', error);

      message.textContent =
        'Unable to submit your recommendation. Please try again.';

    } finally {
      submitButton.disabled = false;
    }
  });
})();


