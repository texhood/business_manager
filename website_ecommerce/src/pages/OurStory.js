import React from 'react';
import './OurStory.css';

function OurStory() {
  return (
    <div className="story-page">
      <section className="story-hero">
        <div className="story-hero-image">
          <img 
            src="https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg" 
            alt="Hood Family Farms at sunset"
          />
        </div>
        <div className="story-hero-content">
          <h1>Our Story</h1>
        </div>
      </section>

      <section className="story-content section">
        <div className="container container-narrow">
          <div className="story-text">
            <h2>Welcome to Hood Family Farms</h2>
            <p>
              We're a small East Texas regenerative farming operation raising pastured poultry 
              and eggs plus grass-fed sheep and cattle on a rotational grazing system plus a 
              chemical free garden with the goal of providing the healthiest, highest quality 
              product to our local community and improving the environment while we do it.
            </p>

            <h3>Our Mission</h3>
            <p>
              Our mission is to raise food to the highest standards for our local community. 
              This means we treat our animals humanely. They graze on grass free of pesticides 
              and herbicides as nature intended, and the way the animals rotate across the 
              pastures is designed to add back important nutrients and microbes to support 
              soil health and carbon sequestration.
            </p>

            <blockquote>
              Simply put: healthier soil = healthier forage for animals = healthier animals = 
              healthier food for people = healthier people.
            </blockquote>

            <h3>Regenerative Practices</h3>
            <p>
              Hood Family Farms operates under the principles of regenerative farming. This means 
              that we use animal impact to improve soil quality and sequester carbon. Regenerative 
              Agriculture is in essence food production in a manner that cares for the animals, 
              improves soil quality over time, and is profitable.
            </p>
            <p>
              It is a system of farming and ranching principles and practices that increases 
              biodiversity, enriches soils, improves watersheds, and enhances ecosystem services. 
              Regenerative Agriculture aims to capture carbon in soil and aboveground biomass, 
              reversing current global trends of atmospheric accumulation.
            </p>

            <h3>Our Vision</h3>
            <p>
              We are passionate about delicious quality food, the environment, and educating 
              those around us on building a healthier more sustainable food system. We believe 
              that something can be both a healthy food staple and beautiful, and we're committed 
              to proving that sustainable farming is not just possible, but profitable and 
              beneficial for everyone involved.
            </p>

            <p className="cta-text">
              Follow along with us on our journey, we can promise, it'll be a wild ride!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OurStory;
