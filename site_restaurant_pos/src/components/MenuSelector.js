import React from 'react';

function MenuSelector({ menus, loading, onSelectMenu }) {
  if (loading) {
    return (
      <div className="menu-selector-page">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading menus...</span>
        </div>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="menu-selector-page">
        <h2>No Menus Available</h2>
        <p>Please create a menu in the back office to start taking orders.</p>
      </div>
    );
  }

  return (
    <div className="menu-selector-page">
      <h2>Select a Menu</h2>
      <p>Choose a menu to start taking orders</p>

      <div className="menu-grid">
        {menus.map(menu => (
          <div
            key={menu.id}
            className={`menu-card ${menu.is_featured ? 'featured' : ''}`}
            onClick={() => onSelectMenu(menu.id)}
          >
            <h3>
              {menu.name}
              {menu.is_featured && <span className="featured-badge">Featured</span>}
            </h3>
            {menu.description && <p>{menu.description}</p>}
            <div className="menu-card-stats">
              <span>{menu.section_count} sections</span>
              <span>•</span>
              <span>{menu.item_count} items</span>
              {menu.menu_type && (
                <>
                  <span>•</span>
                  <span style={{ textTransform: 'capitalize' }}>
                    {menu.menu_type.replace('_', ' ')}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuSelector;
