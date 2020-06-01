exports.renderPage = (req, res) => {
    res.render("home/index", { "title": "Accueil" });
}