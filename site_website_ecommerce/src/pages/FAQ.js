import React, { useState } from 'react';
import './FAQ.css';

const faqs = [
  {
    question: 'How will I receive my products?',
    answer: `We offer regular deliveries in Bullard every Friday, Tyler every Saturday, and Dallas/Houston alternating Wednesdays. Our delivery zones are within 20 miles of Bullard/Tyler/Dallas proper, and for Houston within 20 miles of The Woodlands Mall.

If you live inside these areas we will drop off to your front door (don't worry if you're not home, just leave a cooler out and we'll pop your items inside for safe keeping). If you live outside of the delivery zone, we are happy to work out a location to meet you, just ask! Very often people live in suburbs we drive through anyway to get to our delivery zone!

You can place your order any time you like, and it will be delivered on our next scheduled delivery date. We'll shoot you a text message the day prior to remind you that we're coming.`
  },
  {
    question: 'Can I get my products shipped?',
    answer: `All of our meats are processed in USDA inspected facilities, and thus available to ship nationwide. We ship exclusively to customers who have our farm membership.

We have worked out a shipping system mostly free of single use packaging. Your farm membership is essentially an annual deposit for the continued use of the insulated shipping totes (so rather than having the cost of shipping materials added in to the price of each item, it is an optional add on for those who choose to use this service), that also comes with additional perks like early access to our new harvest quantities, subscription services and more.

The shipping totes are packed with a return label that you can easily slap on and send back to us for the next shipment - no wasted cardboard, styrofoam or ice packs.

Unfortunately TX cottage food laws prohibit us from shipping baked goods, pickles, or jams (basically any food item prepared in our home kitchen). In the spirit of our supporting our local communities rather than trying to be a multi-state operation, we prefer to do deliveries.`
  },
  {
    question: 'Why do your chickens lay different colored eggs?',
    answer: `Different breeds lay different colors, shapes (some are more round, others more conical), and sizes.

We believe that something can be both a healthy food staple and beautiful, so the more variety the better! All of the edible egg parts look the same once they're cracked and in your frying pan!`
  }
];

const glossary = [
  {
    term: 'Continuous grazing',
    definition: 'A grazing system in which livestock are turned into a pasture or grassland and left for an extended period of time. It is characterized by low stocking densities, selective grazing, and no specific rest period for forage recovery.'
  },
  {
    term: 'Non-selective rotational grazing',
    definition: 'A grazing system in which livestock are held on restricted areas of forage at high stocking densities. It is characterized by sub-day livestock movements to new grazing areas, near total forage removal, and longer rest periods for forage recovery. Sometimes called mob grazing.'
  },
  {
    term: 'Regenerative farming/ranching',
    definition: 'Regenerative Agriculture is in essence food production in a manner that cares for the animals, improves soil quality over time, and is profitable. It is a system of farming and ranching principles and practices that increases biodiversity, enriches soils, improves watersheds, and enhances ecosystem services.'
  },
  {
    term: 'Selective rotational grazing',
    definition: 'A grazing system in which livestock are held on restricted areas of forage. It is characterized by multi-day livestock movements to new grazing areas, 1/3 to 1/2 forage removal, and rest periods for forage recovery.'
  },
  {
    term: 'Stocking rate',
    definition: 'The number of livestock per unit area. Livestock counts are usually normalized to "animal units" (AU). This term is usually associated with continuous grazing.'
  },
  {
    term: 'Stocking density',
    definition: 'The weight of livestock per unit area. Occasionally expressed as number of animals per unit area. This term is usually associated with non-selective or mob grazing systems.'
  }
];

const linkCategories = [
  {
    title: 'Movies and Books',
    links: [
      { title: 'Kiss the Ground', type: 'film', url: 'https://kissthegroundmovie.com/' },
      { title: 'Sacred Cow', type: 'book', url: 'https://www.sacredcow.info/book' },
      { title: 'Sacred Cow', type: 'film', url: 'https://www.sacredcow.info/film' },
      { title: 'Carbon Cowboys', type: 'film series', url: 'https://carboncowboys.org/' },
      { title: 'Biggest Little Farm', type: 'film', url: 'https://www.biggestlittlefarmmovie.com/' }
    ]
  },
  {
    title: 'Meat and Climate Change - The Morality of Meat',
    links: [
      { title: 'Can responsible grazing make beef climate neutral?', url: 'https://www.sciencedirect.com/science/article/pii/S0308521X17310338' },
      { title: 'Carbon Sequestration: A Positive Aspect of Beef Cattle Grazing Grasslands', url: 'https://www.beefresearch.org/resources/beef-sustainability/fact-sheets/carbon-sequestration' },
      { title: 'Genetic Improvement of Forage Crops for Climate Change Mitigation', url: 'https://link.springer.com/chapter/10.1007/978-3-319-89341-4_12' },
      { title: 'Healthy Diets from Sustainable Food Systems - EAT Forum', note: '(anti meat)', url: 'https://eatforum.org/' },
      { title: 'Can We Feed the World?', url: 'https://sustainablefoodtrust.org/articles/can-we-feed-the-world/' },
      { title: 'Cowspiracy, Allan Savory and Holistic Management: A Collection Of Rebuttals', url: 'https://savory.global/cowspiracy-a-response/' },
      { title: 'Drawdown: The Most Comprehensive Plan Ever Proposed to Reverse Global Warming', author: 'Paul Hawken', url: 'https://drawdown.org/the-book' },
      { title: 'Is Grassfed Meat and Dairy Better for Human and Environmental Health?', author: 'Frederick D. Provenza, Scott L. Kronberg, and Pablo Gregorini', url: 'https://www.frontiersin.org/articles/10.3389/fnut.2019.00026/full' },
      { title: 'Chemical farming and the loss of human health', author: 'Dr. Zach Bush', url: 'https://www.youtube.com/watch?v=Aw16LPVnNco' }
    ]
  },
  {
    title: 'Genetics',
    links: [
      { title: 'American Mashona', url: 'https://www.americanmashona.com/' }
    ]
  },
  {
    title: 'Regenerative Ranching',
    links: [
      { title: 'Regenerative Ranching with Jaime Elizondo', url: 'https://www.youtube.com/watch?v=QfTZ0rnowcc' },
      { title: 'Allan Savory on Reversing Desertification', url: 'https://www.ted.com/talks/allan_savory_how_to_fight_desertification_and_reverse_climate_change' },
      { title: 'Sustainable Ranching with Johann Zietsman and Jaime Elizondo', url: 'https://www.youtube.com/watch?v=5FvYtQnGfxQ' }
    ],
    subcategories: [
      {
        title: 'Non-selective Intensive Grazing with Jaime Elizondo',
        links: [
          { title: 'Graziers Intensive I Part 1', url: 'https://www.youtube.com/watch?v=J5UwANh9YWw' },
          { title: 'Graziers Intensive I Part 2', url: 'https://www.youtube.com/watch?v=UYXyqSQfP1E' },
          { title: 'Graziers Intensive I Part 3', url: 'https://www.youtube.com/watch?v=wCpINB9FdDw' },
          { title: 'Graziers Intensive I Part 4', url: 'https://www.youtube.com/watch?v=Cv8Yw77bO6M' },
          { title: 'Graziers Intensive I Part 5', url: 'https://www.youtube.com/watch?v=RxVREeNjkZE' },
          { title: 'Graziers Intensive II Part 1', url: 'https://www.youtube.com/watch?v=1XKpSvKxw2c' },
          { title: 'Graziers Intensive II Part 2', url: 'https://www.youtube.com/watch?v=Iu4yE4bNGhQ' },
          { title: 'Graziers Intensive II Part 3', url: 'https://www.youtube.com/watch?v=J0Wgf-J-6ho' }
        ]
      }
    ]
  },
  {
    title: 'Why It\'s Important',
    subcategories: [
      {
        title: 'Joel Salatin',
        links: [
          { title: 'A Story about How it Got Started', event: 'TEDxMidAtlantic', date: '11/05/2009', url: 'https://www.youtube.com/watch?v=4Z75A_JMBx4' },
          { title: 'On Holistic Management', date: '10/23/2014', url: 'https://www.youtube.com/watch?v=UfHtcUZXljw' },
          { title: 'Cows, Carbon and Climate', event: 'TEDxCharlottesville', date: '01/14/2016', url: 'https://www.youtube.com/watch?v=4Z75A_JMBx4' }
        ]
      },
      {
        title: 'Ischani Wheeler',
        links: [
          { title: 'The Good Carbon Story', url: 'https://www.youtube.com/watch?v=K3if0k-Rx5c' }
        ]
      },
      {
        title: 'Tony Lovell',
        links: [
          { title: 'Soil Carbon - Putting Carbon back Where It Belongs - In the Earth', url: 'https://www.youtube.com/watch?v=wgmssrVInP0' },
          { title: 'Fixing the future', event: 'CCCB, Barcelona', date: '2018', url: 'https://www.youtube.com/watch?v=IDgDWbQtlKI' }
        ]
      },
      {
        title: 'Charles Massy',
        links: [
          { 
            title: 'How regenerative farming can help heal the planet and human health', 
            event: 'TEDxCanberra', 
            date: '11/13/2018', 
            url: 'https://www.youtube.com/watch?v=Bw7aoSD0Nbo',
            quotes: [
              'Industrial agriculture produces ...drug-addict plants waiting for their industrial fix of just a few restricted nutrients...',
              'We are called to: regenerative agriculture, source healthy food and nourish communities, love and nourish our planet',
              'Regenerative agriculture can save both the planet and renew human health at the same time'
            ]
          },
          { title: 'Allan Savory in conversation with Charles Massy', event: 'Groundswell', date: '2019', url: 'https://www.youtube.com/watch?v=q7pI7IYaJLI' }
        ]
      }
    ]
  },
  {
    title: 'Commercial Success Stories',
    links: [
      { title: 'Ridgedale Permaculture', url: 'https://www.ridgedalepermaculture.com/' },
      { title: 'Polyface Farms', url: 'https://www.polyfacefarms.com/' },
      { title: 'Polyface Farms - 10 Threads to Farming Success', url: 'https://www.youtube.com/watch?v=5FvYtQnGfxQ' },
      { title: 'Seven Sons', url: 'https://sevensons.net/' },
      { title: 'White Oak Pastures', url: 'https://whiteoakpastures.com/' }
    ]
  },
  {
    title: 'The Sins of Industrial Agriculture',
    links: [
      { title: 'The Poison Papers', note: '(yeah! it\'s really a thing)', url: 'https://www.poisonpapers.org/' }
    ]
  },
  {
    title: 'In the News',
    links: [
      { title: 'Hot and Dry in East Texas', author: 'Interview by Tori Bean', date: 'June 2022', url: '#' }
    ]
  }
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const toggleCategory = (index) => {
    setOpenCategory(openCategory === index ? null : index);
  };

  const renderLink = (link) => (
    <a href={link.url} target="_blank" rel="noopener noreferrer">
      {link.title}
    </a>
  );

  const renderLinkMeta = (link) => (
    <>
      {link.type && <span className="link-type">({link.type})</span>}
      {link.author && <span className="link-author">— {link.author}</span>}
      {link.event && <span className="link-event">{link.event}</span>}
      {link.date && <span className="link-date">{link.date}</span>}
      {link.note && <span className="link-note">{link.note}</span>}
    </>
  );

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className="faq-hero">
        <div className="faq-hero-image">
          <img 
            src="https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555901227734-ORPBLUM5NXSYF9BHG2DV/lazy+cows.jpg" 
            alt="Cows grazing in pasture"
          />
        </div>
        <div className="faq-hero-content">
          <h1>Frequently Asked Questions</h1>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section section">
        <div className="container container-narrow">
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${openIndex === index ? 'open' : ''}`}
              >
                <button 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                  <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-content">
                    {faq.answer.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Links Section */}
      <section className="links-section section bg-light">
        <div className="container container-narrow">
          <h2>Links</h2>
          
          {linkCategories.map((category, catIndex) => (
            <div key={catIndex} className="link-category">
              <h3 
                className={`link-category-title ${category.subcategories ? 'expandable' : ''}`}
                onClick={() => category.subcategories && toggleCategory(catIndex)}
              >
                {category.title}
                {category.subcategories && (
                  <span className="expand-icon">{openCategory === catIndex ? '−' : '+'}</span>
                )}
              </h3>
              
              {/* Direct links */}
              {category.links && (
                <ul className="link-list">
                  {category.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {renderLink(link)}
                      {renderLinkMeta(link)}
                      {link.quotes && (
                        <ul className="link-quotes">
                          {link.quotes.map((quote, qIndex) => (
                            <li key={qIndex}><em>"{quote}"</em></li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              
              {/* Subcategories */}
              {category.subcategories && (
                <div className={`subcategories ${openCategory === catIndex ? 'open' : ''}`}>
                  {category.subcategories.map((sub, subIndex) => (
                    <div key={subIndex} className="subcategory">
                      <h4>{sub.title}</h4>
                      <ul className="link-list">
                        {sub.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            {renderLink(link)}
                            {renderLinkMeta(link)}
                            {link.quotes && (
                              <ul className="link-quotes">
                                {link.quotes.map((quote, qIndex) => (
                                  <li key={qIndex}><em>"{quote}"</em></li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Glossary Section */}
      <section className="glossary-section section">
        <div className="container container-narrow">
          <h2>Glossary</h2>
          <dl className="glossary-list">
            {glossary.map((item, index) => (
              <div key={index} className="glossary-item">
                <dt>{item.term}</dt>
                <dd>{item.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

export default FAQ;
