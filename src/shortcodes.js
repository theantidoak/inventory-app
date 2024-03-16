function createSlug(name) {
  return name ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') : '';
}

module.exports = { createSlug }