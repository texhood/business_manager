/**
 * AppCard Component
 * Individual app tile in the portal launcher grid
 */

import React from 'react';
import {
  Building2, CreditCard, UtensilsCrossed, ChefHat,
  Rabbit, ShoppingBag, Palette, LayoutDashboard, Lock
} from 'lucide-react';

// Map icon names from the DB to lucide-react components
const ICON_MAP = {
  'building-2': Building2,
  'credit-card': CreditCard,
  'utensils-crossed': UtensilsCrossed,
  'chef-hat': ChefHat,
  'rabbit': Rabbit,
  'shopping-bag': ShoppingBag,
  'palette': Palette,
  'layout-dashboard': LayoutDashboard,
};

const TIER_NAMES = {
  1: 'Starter',
  2: 'Professional',
  3: 'Enterprise',
};

const AppCard = ({ app, onLaunch }) => {
  const IconComponent = ICON_MAP[app.icon] || LayoutDashboard;
  const isLocked = !app.hasAccess;

  const handleClick = () => {
    if (isLocked) return;
    onLaunch(app);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const getLockLabel = () => {
    switch (app.accessReason) {
      case 'tier_required':
        return `${TIER_NAMES[app.minPlanTier] || 'Upgrade'} Plan`;
      case 'role_required':
        return 'No Access';
      case 'admin_disabled':
        return 'Disabled';
      case 'subscription_inactive':
        return 'Billing Issue';
      default:
        return 'Locked';
    }
  };

  return (
    <div
      className={`app-card ${isLocked ? 'locked' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-label={`${app.name}${isLocked ? ' — locked' : ''}`}
    >
      <div className="app-icon">
        <IconComponent size={24} />
      </div>

      <div className="app-info">
        <div className="app-name">
          {app.name}
        </div>
        <div className="app-description">{app.description}</div>
        {!isLocked && app.accessCount > 0 && (
          <div className="access-count">
            Opened {app.accessCount} time{app.accessCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {isLocked && (
        <div className="lock-badge">
          <Lock size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
          {getLockLabel()}
        </div>
      )}
    </div>
  );
};

export default AppCard;
