'use strict';

const testimonials = require('../db/source/testimonials.json');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const testimonialsData = testimonials.map(testimonial => ({
      id: uuidv4(),
      testimonial: testimonial.testimonial,
      owner: testimonial.owner,
    }));

    await queryInterface.bulkInsert('testimonials', testimonialsData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('testimonials', null, {});
  }
};
