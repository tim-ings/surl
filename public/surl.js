const linkTag = document.getElementById("short-link");
const errorTag = document.getElementById("error");
const loaderTag = document.getElementById("loader");
const urlInpTag = document.getElementById("inp-url");
const slugInpTag = document.getElementById("inp-slug");

const initialState = {
    link: "",
    error: "",
    loading: false,
}

let state = {
    ...initialState,
}

const setState = (newState) => {
    state = newState;

    linkTag.classList.toggle("hidden", !(state.link && state.link.length > 0));
    loaderTag.classList.toggle("hidden", !state.loading);
    linkTag.value = state.link;
    errorTag.textContent = state.error;
}

window.onload = () => {
    if (window.location.search.indexOf("iframe=true") !== -1) {
        console.log("iframe is true");
        const container = document.querySelector(".container");
        container.style.margin = "0";
    }
}

const setLink = (url) =>
    setState({
        link: url,
        error: "",
        loading: false,
    });

const copyLink = () => {
    setState(state);
    linkTag.select();
    linkTag.setSelectionRange(0, 99999);
    document.execCommand("copy");
}

const setError = (err) =>
    setState({
        ...state,
        link: "",
        loading: false,
        error: err,
    });

const readForm = () => [urlInpTag.value, slugInpTag.value];

const resetApp = () => setState({ ...initialState });

document.getElementById("create-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    setLink("");

    const [url, slug] = readForm();
    if (!url || url.length <= 0) {
        return setError("Please enter a URL");
    }

    setState({
        ...state,
        loading: true,
    });
    
    try {
        const resp = await fetch("https://surl.tim-ings.com/run", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url,
                slug,
            }),
        });
        const data = await resp.json();
        resp.ok ? setLink(data.url) : setError(data.message);
    } catch (err) {
        setError(err.message);
    } finally {
        setState({
            ...state,
            loading: false,
        });
    }
});
