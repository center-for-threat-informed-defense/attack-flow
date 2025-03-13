// add smooth scroll when clicking on an anchor
// helps enable the active TOC highlight
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth",
        });
    });
});

// Get all sections that have an ID defined
const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

// Add an event listener listening for scroll
window.addEventListener("scroll", navHighlighter);

function navHighlighter() {
    // Get current scroll position
    const targetY = + document.querySelector("header").offsetHeight;
    let closestEl = null;
    let closestDist = 999999;
    const navLinks = document.querySelectorAll(".page-toc li a");

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
        for (const navLink of navLinks) {
            if (navLink.innerText.trim() === closestEl.innerText.trim()) {
                navLinks.forEach(nl => nl.classList.remove("active"));
                navLink.classList.add("active");
                break;
            }
        }
    }
}
