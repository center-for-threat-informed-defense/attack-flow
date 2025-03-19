const firstSection = document.querySelector("#main section:first-child");
const firstHeader = firstSection.querySelector("h1, h2, h3, h4, h5, h6");

/**
 * Add smooth scroll to page when user clicks on an anchor
 * This helps enable the active TOC highlight
 */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const href = this.getAttribute("href");
        let el;
        if (href === "#") {
            // Sphinx does this annoying thing where the first TOC entry doesn't
            // have the correct anchor, it's just #.
            el = firstSection;
        } else {
            el = document.querySelector(this.getAttribute("href"));
        }
        el.scrollIntoView({ behavior: "smooth" });
    });
});

// Get all headings within the post content section
const headings = document.querySelectorAll("section[id] h1, section[id] h2, section[id] h3, section[id] h4, section[id] h5, section[id] h6");
const navLinks = document.querySelectorAll(".page-toc li a");

// Add an event listener listening for scroll
if (navLinks.length > 0) {
    window.addEventListener("scroll", navHighlighter);
}

/**
 * On scroll, determine the current heading that is closest to the top of the viewport (but still
 * underneath the navbar) and make it active.
 */
function navHighlighter() {
    // Get current scroll position
    const targetY = + document.querySelector("header").offsetHeight;

    let closestEl = null;
    let closestDist = 999999;

    // Find the closest heading that is in the viewport (if any).
    for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
            // This element is off screen;
            continue;
        }

        // Look for the heading who's midpoint is closest to the target coordinate.
        const yMidpoint = rect.top + rect.height / 2;
        const dist = yMidpoint - targetY;
        if (dist > 0 && dist < closestDist) {
            closestDist = dist;
            closestEl = heading;
        }
    }

    // If you found a heading and it matches a navlink, then make that navlink the
    // current active link.
    if (closestEl) {
        let sectionId = closestEl.parentNode.id;
        if (closestEl === firstHeader) {
            // Sphinx does this annoying thing where the first TOC entry doesn't
            // have the correct anchor, it's just #.
            navLinks.forEach(nl => nl.classList.remove("active"));
            navLinks[0].classList.add("active");
        } else {
            for (const navLink of navLinks) {
                if (navLink.hash === `#${sectionId}`) {
                    navLinks.forEach(nl => nl.classList.remove("active"));
                    navLink.classList.add("active");
                    break;
                }
            }
        }
    }
}