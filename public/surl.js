let linkState = "";
let errorState = "";
const linkTag = document.getElementById("short-link");
const errorTag = document.getElementById("error");

const updateRender = () => {
    linkTag.classList.toggle("hidden", !(linkState && linkState.length > 0));
    linkTag.value = linkState;
    errorTag.textContent = errorState;
}

const setLink = (url) => {
    linkState = url;
    errorState = "";
    updateRender();
}

const copyLink = () => {
    updateRender();
    linkTag.select();
    linkTag.setSelectionRange(0, 99999);
    document.execCommand("copy");
}

const setError = (err) => {
    errorState = err;
    linkState = "";
    console.error(errorState);
    updateRender();
}

document.getElementById("create-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    setLink("");
    const url = document.getElementById("inp-url").value;
    const slug = document.getElementById("inp-slug").value;
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
        console.log(data);
        resp.ok ? setLink(data.url) : setError(data.message);
    } catch (err) {
        setError(err.message);
    }
});
