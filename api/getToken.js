const token = process.env.MAPBOX_TOKEN;

module.exports = async (req, res) => {
    return res.status(200).json(token);
}
