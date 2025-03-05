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
    let scrollY = window.scrollY;

    headings.forEach((current) => {
        const headingHeight = current.offsetHeight;
        const headingTop = current.offsetTop;
        const headingId = current.innerText;
        // look for the heading that matches current scroll position
        if (
            headingId &&
            scrollY > headingTop &&
            scrollY <= headingTop + headingHeight
        ) {
            // search nav items for the heading that matches
            const navItems = document.querySelectorAll(".page-toc li a");
            navItems.forEach((navItemMatch) => {
                if (navItemMatch.innerText === headingId) {
                    navItemMatch.classList.add("active");
                } else {
                    navItemMatch.classList.remove("active");
                }
            });
        }
    });
}
