// 🚀 Entertainment Web App Script
// Developer: Ashutosh

// Global variables: main container and search box
const mainContainer = document.querySelector("main");
const searchBox = document.querySelector("#search-box");

// Function to handle GSAP animations
const gsapAnimations = () => {
  const tl = gsap.timeline();

  tl.from("#loader h1 span, #loader img", {
    transform: "translateY(-150px) rotate(-10deg)",
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
  });

  tl.to("#loader h1 span, #loader img", {
    transform: "translateY(-50px) rotate(-10deg)",
    opacity: 0,
    duration: 0.4,
    stagger: 0.1,
    delay: 1,
  });

  tl.to("#loader", {
    y: "-100%",
    duration: 0.75,
  });

  tl.to("html,body", {
    pointerEvents: "auto",
  });

  tl.from(".sidebar .logo,.sidebar li,.sidebar .user", {
    y: 20,
    opacity: 0,
    duration: 0.4,
    stagger: 0.1,
  });

  tl.from(".search-bar", {
    y: 20,
    opacity: 0,
  });
};

// Function for card entrance animation
const cardAnimation = () => {
  gsap.from(".card-main", {
    scale: 0.2,
    opacity: 0,
    duration: 0.4,
    stagger: 0.1,
  });
};

// Function to remove card with exit animation
const removeCardAnimation = (card) => {
  gsap.to(card, {
    scale: 0,
    opacity: 0,
    duration: 0.4,
  });
};

// Function to scroll to the top of the page
const scrollToTop = () => {
  document.body.scrollTop = 0;
};

// Function to toggle the active class on navigation elements
const toggleActiveClass = () => {
  const navElements = document.querySelectorAll(".sidebar nav ul li");

  navElements.forEach((navElement) => {
    navElement.addEventListener("click", () => {
      navElements.forEach((e) =>
        e.querySelector("svg").classList.remove("active")
      );
      navElement.querySelector("svg").classList.add("active");
    });
  });
};

// Function to fetch data from JSON file
const fetchData = async () => {
  const response = await fetch("./assets/data.json");
  const fetchedData =
    localStorage.getItem("json-data") !== null
      ? await JSON.parse(localStorage.getItem("json-data"))
      : await response.json();
  localStorage.getItem("json-data") === null &&
    localStorage.setItem("json-data", fetchedData);
  return fetchedData;
};

// Function to create HTML for a card
const createCardHTML = (data) => {
  const { id, title, thumbnail, year, category, rating, isBookmarked } = data;
  const div = document.createElement("div");

  // Set class and attributes for the card
  div.className = "card-main";
  div.id = id;
  div.setAttribute("data-bookmarked", isBookmarked);

  // Populate HTML for the card
  div.innerHTML = `
        <div class="card" style="background-image:url(./${thumbnail});">
            <div class="bookmark-flag">
                <img src="./assets/icons/icon-bookmark-${
                  isBookmarked ? "full" : "empty"
                }.svg" alt="">
            </div>
            <div class="details">
                <ul>
                    <li>${year}</li>
                    <li>
                        <img src="./assets/icons/icon-category-${
                          category === "Movie" ? "movie" : "tv"
                        }.svg" alt="">
                        ${category}
                    </li>
                    <li>${rating}</li>
                </ul>
                <h2>${title}</h2>
            </div>
            <div class="play-section">
                <button class="play-btn">
                    <img src="./assets/icons/icon-play.svg" alt="">Play
                </button>
            </div>
        </div>
        <div class="details">
            <ul>
                <li>${year}</li>
                <li>
                    <img src="./assets/icons/icon-category-${
                      category === "Movie" ? "movie" : "tv"
                    }.svg" alt="">
                    ${category}
                </li>
                <li>${rating}</li>
            </ul>
            <h2>${title}</h2>
        </div>
    `;
  return div;
};

// Function to create HTML for a section
const createSectionHTML = (title, id) => {
  const section = document.createElement("section");
  section.innerHTML = `
        <h1>${title}</h1>
        <div class="section" id=${id}></div>
    `;
  return section;
};

// Function to dynamically create sections based on navigation clicks
const createPage = async () => {
  const navElement = document.querySelector(".sidebar nav ul");

  // Add click event listener to the navigation elements
  navElement.addEventListener("click", async (event) => {
    const elem = event.target;

    // Check if the clicked element is a navigation element
    if (elem.tagName === "path" || elem.tagName === "svg") {
      const navigator =
        elem.tagName === "path"
          ? elem.parentElement.parentElement
          : elem.parentElement;

      // Get the category to navigate to from the data attribute
      const dataAttr = navigator.getAttribute("data-navigateTo");
      const category =
        dataAttr === "Home"
          ? "Home"
          : dataAttr === "Movie"
          ? "Movie"
          : dataAttr === "TV Series"
          ? "TV Series"
          : "Bookmarks";

      // Create a new section based on the selected category
      const section = createSectionHTML(
        dataAttr === "Movie" ? dataAttr + "s" : dataAttr,
        category === "TV Series" ? "series" : dataAttr
      );

      const sectionDiv = section.querySelector(
        `#${category === "TV Series" ? "series" : dataAttr}`
      );

      // Fetch data from JSON file
      const fetchedData = await fetchData();

      // Iterate through the data and populate the section with relevant cards
      for (let data of fetchedData) {
        if (data.category === category) {
          const div = createCardHTML(data);
          sectionDiv.appendChild(div);
          searchBox.setAttribute(
            "placeholder",
            `Search for ${data.category}${data.category === "Movie" ? "s" : ""}`
          );
        } else if (category === "Home") {
          searchBox.setAttribute(
            "placeholder",
            `Search for Movies or TV Series`
          );
          createHomePage();
          break;
        } else if (category === "Bookmarks") {
          searchBox.setAttribute(
            "placeholder",
            `Search bookmarked Movies or TV Series`
          );
          createBookmarkPage();
          break;
        }
      }

      // Clear the main container and append the new section
      main.innerHTML = "";
      category !== "Home" &&
        category !== "Bookmarks" &&
        (main.append(section), cardAnimation());
      toggleBookmark();
      initiateSearch();
      scrollToTop();
    }
  });
};

// Function to create the homepage with trending and recommended sections
const createHomePage = async () => {
  const fetchedData = await fetchData();
  const trendingSection = createSectionHTML("Trendings", "trending");
  const recommendedSection = createSectionHTML(
    "Recommended for you",
    "recommended"
  );

  fetchedData.forEach((data) => {
    const section = data.isTrending ? trendingSection : recommendedSection;
    const div = createCardHTML(data);
    data.isTrending && div.classList.add("trend");
    section.querySelector(".section").appendChild(div);
  });

  main.append(trendingSection, recommendedSection);
  toggleBookmark();
  cardAnimation();
};

// Function to create the bookmarks page
const createBookmarkPage = async () => {
  const fetchedData = await fetchData();
  const section = createSectionHTML("Bookmarks", "bookmarks");

  fetchedData.forEach((data) => {
    if (data.isBookmarked) {
      const div = createCardHTML(data);
      section.querySelector(".section").appendChild(div);
    }
  });

  main.append(section);
  toggleBookmark();
  section.querySelector(".section").length > 0 && cardAnimation();
};

// Function to toggle the bookmark status on click
const toggleBookmark = () => {
  const flags = main.querySelectorAll(".bookmark-flag");

  flags.forEach((flag) => {
    const img = flag.querySelector("img");

    flag.addEventListener("click", async () => {
      const parentElement = flag.parentElement.parentElement;
      const isBookmarked = JSON.parse(parentElement.dataset.bookmarked);
      const fetchedData = await fetchData();
      let newData = [];

      parentElement.dataset.bookmarked = !isBookmarked;
      flag.style.scale = 0.85;

      newData = fetchedData.map((data) => {
        data.id === parentElement.id &&
          (data.isBookmarked = JSON.parse(parentElement.dataset.bookmarked));
        return data;
      });
      localStorage.setItem("json-data", JSON.stringify(newData));

      setTimeout(() => {
        img.setAttribute(
          "src",
          `./assets/icons/icon-bookmark-${
            JSON.parse(parentElement.dataset.bookmarked) ? "full" : "empty"
          }.svg`
        );
        flag.style.scale = 1;
      }, 250);

      if (
        document.querySelector(".sidebar nav ul .active").parentElement.id ===
          "bookmarks" &&
        !JSON.parse(parentElement.dataset.bookmarked)
      ) {
        setTimeout(() => removeCardAnimation(parentElement), 400);
        setTimeout(() => parentElement.remove(), 900);
      }
    });
  });
};

// Function to initiate search functionality
const initiateSearch = async () => {
  const fetchedData = await fetchData();
  const pageData = main.innerHTML;
  let searchData = [];

  main.querySelectorAll(".card-main").forEach((card) => {
    const matchingData = fetchedData.find((data) => data.id === card.id);
    matchingData && searchData.push(matchingData);
  });

  searchBox.addEventListener("input", () => {
    const searchValue = searchBox.value.trim();
    if (searchValue !== "") {
      main.innerHTML = "";
      const matchedData = searchData.filter((e) =>
        e.title.toLowerCase().includes(searchValue.toLowerCase())
      );

      main.appendChild(
        createSectionHTML(
          `Found ${matchedData.length} results for '${searchValue}'`,
          "results-container"
        )
      );

      matchedData.length > 0
        ? (matchedData.forEach((data) =>
            main
              .querySelector("#results-container")
              .appendChild(createCardHTML(data))
          ),
          cardAnimation())
        : (main.querySelector(
            "h1"
          ).textContent = `No results found for '${searchValue}'`);
    } else {
      main.innerHTML = pageData;
      cardAnimation();
    }
    toggleBookmark();
  });
};

// Initial setup
gsapAnimations();
toggleActiveClass();
createHomePage();
createPage();
initiateSearch();
