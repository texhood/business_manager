/**
 * DeliveryZonesView Component
 * Manage delivery zones
 */

import React from 'react';
import { Icons } from '../common/Icons';

const DeliveryZonesView = ({ zones, loading }) => {
  return (
    <div>
      <div className="page-header">
        <h1>Delivery Zones</h1>
        <p className="subtitle">Manage delivery areas and schedules</p>
      </div>
      
      <div className="card">
        {loading ? (
          <div style={{textAlign: 'center', padding: '40px'}}>
            <Icons.Loader /> Loading...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Base City</th>
                  <th>Schedule</th>
                  <th>Radius</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {zones.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                      No delivery zones configured
                    </td>
                  </tr>
                ) : (
                  zones.map(zone => (
                    <tr key={zone.id}>
                      <td><strong>{zone.name}</strong></td>
                      <td>{zone.base_city}</td>
                      <td>{zone.schedule}</td>
                      <td>{zone.radius} miles</td>
                      <td>
                        <span className={`badge ${zone.is_active ? 'badge-green' : 'badge-gray'}`}>
                          {zone.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryZonesView;
