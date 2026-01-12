import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-image">
          <img 
            src="https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg" 
            alt="Hood Family Farms chickens in pasture"
          />
        </div>
        <div className="hero-content">
          <div className="hero-buttons">
            <Link to="/shopping" className="btn btn-primary btn-lg">Shop Now</Link>
            <Link to="/frequently-asked-questions" className="btn btn-secondary btn-lg">Learn More</Link>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-image">
              <img 
                src="https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg" 
                alt="Cow at sunset"
              />
            </div>
            <div className="mission-content">
              <h2>Crowdfund with your Favorite Farm</h2>
              <p>
                Our mission is to raise food to the highest standards for our local community. 
                This means we treat our animals humanely. They graze on grass free of pesticides 
                and herbicides as nature intended, and the way the animals rotate across the 
                pastures is designed to add back important nutrients and microbes to support 
                soil health and carbon sequestration.
              </p>
              <p className="highlight">
                Simply put: healthier soil = healthier forage for animals = healthier animals = 
                healthier food for people = healthier people.
              </p>
              <p>
                We are passionate about delicious quality food, the environment, and educating 
                those around us on building a healthier more sustainable food system.
              </p>
              <p>
                In order to continue to support our mission, we have to scale up to keep costs down. 
                We've identified multiple ways to increase revenues so that we can make this happen 
                including adding overnight farm stays on Airbnb and offering freshly prepared farm 
                foods for sale in a mobile food trailer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section section bg-light">
        <div className="container">
          <div className="welcome-content text-center">
            <div className="welcome-image">
              <img 
                src="https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg" 
                alt="Farm in morning mist"
              />
            </div>
            <h2>Welcome to the Farm!</h2>
            <p>
              We're a small East Texas regenerative farming operation raising pastured poultry 
              and eggs plus grass-fed sheep and cattle on a rotational grazing system plus a 
              chemical free garden with the goal of providing the healthiest, highest quality 
              product to our local community and improving the environment while we do it.
            </p>
            <p>Follow along with us on our journey, we can promise, it'll be a wild ride!</p>
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="gallery-preview section">
        <div className="container">
          <div className="gallery-card">
            <Link to="/gallery">
              <div className="gallery-card-image">
                <img 
                  src="https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg" 
                  alt="Farm sunset view"
                />
              </div>
              <div className="gallery-card-content">
                <h3>Gallery</h3>
                <p>Photos from around the farm</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Regenerative Section */}
      <section className="regenerative-section section bg-primary">
        <div className="container text-center">
          <h2>Going beyond sustainability and supporting a regenerative way of life.</h2>
          <p>
            Hood Family Farms operates under the principles of regenerative farming. 
            This means that we use animal impact to improve soil quality and sequester carbon… 
            pretty awesome, right?!
          </p>
          <Link to="/story" className="btn btn-white btn-lg">Our Story</Link>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="instagram-section section">
        <div className="container">
          <h2 className="text-center">Follow Our Journey</h2>
          <p className="text-center mb-4">
            Stay connected with us on social media for daily updates from the farm
          </p>
          <div className="instagram-grid">
            <a 
              href="https://www.instagram.com/hoodfamilyfarms/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="instagram-item"
            >
              <img 
                src="https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1716822411813-V6HY1XQEI0JVL1SONZ5G/image-asset.jpeg" 
                alt="Farm to Fork catering at wedding"
              />
            </a>
          </div>
          <div className="text-center mt-4">
            <a 
              href="https://www.instagram.com/hoodfamilyfarms/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Follow @hoodfamilyfarms
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
