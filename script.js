const main = document.querySelector('main');
const searchBox = document.querySelector('#search-box');

const loaderAnimation = () => {
    const loader = document.querySelector('#loader');
    setTimeout(() => loader.style.top = '-100vh', 5100);
};

const toggleActiveClass = () => {
    const navElements = document.querySelectorAll('.sidebar nav ul li');

    navElements.forEach(navElement => {
        navElement.addEventListener('click', () => {
            navElements.forEach(el => el.querySelector('svg').classList.remove('active'));
            navElement.querySelector('svg').classList.add('active');
        });
    });
};

const fetchData = async () => {
    const response = await fetch('./assets/data.json');
    const fetchedData = await response.json();
    return fetchedData;
};

const createCardHTML = (data) => {
    const { id, title, thumbnail, year, category, rating, isBookmarked } = data;
    const div = document.createElement('div');

    div.className = 'card-main';
    div.id = id;
    div.setAttribute('data-bookmarked', isBookmarked);
    div.innerHTML = `
        <div class="card" style="background-image:url(./${thumbnail});">
            <div class="bookmark-flag">
                <img src="./assets/icons/icon-bookmark-${isBookmarked ? 'full' : 'empty'}.svg" alt="">
            </div>
            <div class="details">
                <ul>
                    <li>${year}</li>
                    <li>
                        <img src="./assets/icons/icon-category-${category === 'Movie' ? 'movie' : 'tv'}.svg" alt="">
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
                    <img src="./assets/icons/icon-category-${category === 'Movie' ? 'movie' : 'tv'}.svg" alt="">
                    ${category}
                </li>
                <li>${rating}</li>
            </ul>
            <h2>${title}</h2>
        </div>
    `;
    return div;
};

const createSectionHTML = (title, id) => {
    const section = document.createElement('section');
    section.innerHTML = `
        <h1>${title}</h1>
        <div class="section" id=${id}></div>
    `;
    return section;
};

const createPage = async () => {
    const navElement = document.querySelector('.sidebar nav ul');

    navElement.addEventListener('click', async (event) => {
        const elem = event.target;

        if (elem.tagName === 'path' || elem.tagName === 'svg') {
            const navigator = elem.tagName === 'path' ? elem.parentElement.parentElement : elem.parentElement;
            const dataAttr = navigator.getAttribute('data-navigateTo');
            const category = dataAttr === 'Home' ? 'Home' : dataAttr === 'Movie' ? 'Movie' : dataAttr === 'TV Series' ? 'TV Series' : 'Bookmarks';
            const section = createSectionHTML(dataAttr === 'Movie' ? dataAttr + 's' : dataAttr, category === 'TV Series' ? 'series' : dataAttr);
            const sectionDiv = section.querySelector(`#${category === 'TV Series' ? 'series' : dataAttr}`);

            const fetchedData = await fetchData();

            for (data of fetchedData) {
                if (data.category === category) {
                    const div = createCardHTML(data);
                    sectionDiv.appendChild(div);
                    searchBox.setAttribute('placeholder', `Search for ${data.category}${data.category === 'Movie' ? 's' : ''}`);
                } else if (category === 'Home') {
                    searchBox.setAttribute('placeholder', `Search for Movies or TV Series`);
                    createHomePage();
                    break;
                } else if (category === 'Bookmarks') {
                    searchBox.setAttribute('placeholder', `Search bookmarked Movies or TV Series`);
                    createBookmarkPage();
                    break;
                }
            }

            main.innerHTML = '';
            category !== 'Home' && category !== 'Bookmarks' && main.append(section);
            toggleBookmark();
            initiateSearch();
        }
    });
};

const createHomePage = async () => {
    const fetchedData = await fetchData();
    const trendingSection = createSectionHTML('Trendings', 'trending');
    const recommendedSection = createSectionHTML('Recommended for you', 'recommended');

    fetchedData.forEach(data => {
        const section = data.isTrending ? trendingSection : recommendedSection;
        const div = createCardHTML(data);
        data.isTrending && div.classList.add('trend');
        section.querySelector('.section').appendChild(div);
    });

    main.append(trendingSection, recommendedSection);
    toggleBookmark();
};

const createBookmarkPage = async () => {
    const fetchedData = await fetchData();
    const section = createSectionHTML('Bookmarks', 'bookmarks');

    fetchedData.forEach(data => {
        if (data.isBookmarked) {
            const div = createCardHTML(data);
            section.querySelector('.section').appendChild(div);
        }
    });

    main.append(section);
    toggleBookmark();
};

const toggleBookmark = () => {
    const flags = main.querySelectorAll('.bookmark-flag');

    flags.forEach(flag => {
        const img = flag.querySelector('img');

        flag.addEventListener('click', () => {
            const parentElement = flag.parentElement.parentElement;
            const isBookmarked = JSON.parse(parentElement.dataset.bookmarked);

            parentElement.dataset.bookmarked = !isBookmarked;
            flag.style.scale = 0.85;

            setTimeout(() => {
                img.setAttribute('src', `./assets/icons/icon-bookmark-${JSON.parse(parentElement.dataset.bookmarked) ? 'full' : 'empty'}.svg`);
                flag.style.scale = 1;
            }, 250);
        });
    });
};

const initiateSearch = async () => {
    const fetchedData = await fetchData();
    const pageData = main.innerHTML;
    let searchData = [];

    main.querySelectorAll('.card-main').forEach(card => {
        const matchingData = fetchedData.find(data => data.id === card.id);
        matchingData && searchData.push(matchingData);
    });

    searchBox.addEventListener('input', () => {
        const searchValue = searchBox.value.trim();
        if (searchValue !== '') {
            main.innerHTML = '';
            const matchedData = searchData.filter(e => e.title.toLowerCase().includes(searchValue.toLowerCase()));

            main.appendChild(createSectionHTML(`Found ${matchedData.length} results for '${searchValue}'`, 'results-container'));

            matchedData.length > 0 ? matchedData.forEach(data => main.querySelector('#results-container').appendChild(createCardHTML(data))) : main.querySelector('h1').textContent = `No results found for '${searchValue}'`;
        } else {
            main.innerHTML = pageData;
        }
        toggleBookmark();
    });
};

loaderAnimation();
toggleActiveClass();
createHomePage();
createPage();
initiateSearch();
