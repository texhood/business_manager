import React from 'react';
import './Gallery.css';

const galleryImages = [
  {
    src: 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555900163717-AYN5T9AUW61HX4WYDX8K/wide+shot+sunset.jpg',
    alt: 'Farm sunset view'
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg',
    alt: 'Cow at sunset'
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg',
    alt: 'Farm in morning mist'
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg',
    alt: 'Chickens in pasture'
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197280315-XR0BSJJC51JDAZ5LJ40Q/022824-HOOD+2.jpg',
    alt: 'Food trailer'
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197283561-G1ZM48P91C7RVL23M2ZX/022824-HOOD+6.jpg',
    alt: 'Farm food preparation'
  }
];

function Gallery() {
  return (
    <div className="gallery-page">
      <section className="gallery-hero">
        <div className="container">
          <h1>Gallery</h1>
          <p>Photos from around the farm</p>
        </div>
      </section>

      <section className="gallery-content section">
        <div className="container">
          <div className="gallery-masonry">
            {galleryImages.map((image, index) => (
              <div key={index} className="gallery-image-item">
                <img src={image.src} alt={image.alt} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Gallery;
