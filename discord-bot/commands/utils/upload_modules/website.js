const push_website = async (file, filename) => {
    if (!file || !filename) {
        throw new Error('Missing required parameters: file and filename');
    }

    const website_file = {};
    if (file.md5) website_file.md5 = file.md5;
    if (file.artist) website_file.artist = file.artist;
    if (file.title) website_file.title = file.title;
    if (file.performer) website_file.performer = file.performer;
    if (file.editor) website_file.editor = file.editor;
    if (file.sources) website_file.sources = file.sources;
    if (file.comments) website_file.comments = file.comments;
    if (file.editor_discord_id) website_file.editor_discord_id = file.editor_discord_id;

    if (!file.performer) {
        throw new Error('Missing required property: performer');
    }

    switch (file.performer.toLowerCase()) {
        case "solo":
            website_file.website_file_path = `/files/1_solos/${filename}.mid`;
            break;
        case "duet":
            website_file.website_file_path = `/files/2_duets/${filename}.mid`;
            break;
        case "trio":
            website_file.website_file_path = `/files/3_trios/${filename}.mid`;
            break;
        case "quartet":
            website_file.website_file_path = `/files/4_quartets/${filename}.mid`;
            break;
        case "quintet":
            website_file.website_file_path = `/files/5_quintets/${filename}.mid`;
            break;
        case "sextet":
            website_file.website_file_path = `/files/6_sextets/${filename}.mid`;
            break;
        case "septet":
            website_file.website_file_path = `/files/7_septets/${filename}.mid`;
            break;
        case "octet":
            website_file.website_file_path = `/files/8_octets/${filename}.mid`;
            break;
        default:
            throw new Error(`Unknown performer type: ${file.performer}`);
    }

    website_file.link = `/file/${file.md5}`;

    return website_file;
}

module.exports = push_website;