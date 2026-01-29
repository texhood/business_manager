/**
 * Contact Form Block Component
 * Customizable contact form
 */

import React, { useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { api } from '../../services/api';
import './blocks.css';

const ContactFormBlock = ({ content, settings }) => {
  const site = useSite();
  
  const {
    title = 'Send a Message',
    description = '',
    recipientEmail = '',
    submitButtonText = 'Send Message',
    successMessage = 'Thank you! Your message has been sent.',
    fields = [
      { type: 'text', name: 'firstName', label: 'First Name', required: true },
      { type: 'text', name: 'lastName', label: 'Last Name', required: true },
      { type: 'email', name: 'email', label: 'Email', required: true },
      { type: 'textarea', name: 'message', label: 'Message', required: true }
    ]
  } = content;

  const { backgroundColor = '', padding = 'large' } = settings;

  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post('/contact/submit', {
        ...formData,
        recipientEmail: recipientEmail || site.contactInfo?.email,
        siteName: site.siteName
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({});
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const { type, name, label, required, options = [], placeholder = '' } = field;
    const value = formData[name] || '';

    switch (type) {
      case 'textarea':
        return (
          <div key={name} className="form-group">
            <label htmlFor={name}>
              {label} {required && <span className="required">*</span>}
            </label>
            <textarea
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
              required={required}
              placeholder={placeholder}
              rows={5}
            />
          </div>
        );

      case 'select':
        return (
          <div key={name} className="form-group">
            <label htmlFor={name}>
              {label} {required && <span className="required">*</span>}
            </label>
            <select
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
              required={required}
            >
              <option value="">Select...</option>
              {options.map((opt, i) => (
                <option key={i} value={typeof opt === 'string' ? opt : opt.value}>
                  {typeof opt === 'string' ? opt : opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'email':
        return (
          <div key={name} className="form-group">
            <label htmlFor={name}>
              {label} {required && <span className="required">*</span>}
            </label>
            <input
              type="email"
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
              required={required}
              placeholder={placeholder}
            />
          </div>
        );

      case 'tel':
        return (
          <div key={name} className="form-group">
            <label htmlFor={name}>
              {label} {required && <span className="required">*</span>}
            </label>
            <input
              type="tel"
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
              required={required}
              placeholder={placeholder}
            />
          </div>
        );

      default: // text
        return (
          <div key={name} className="form-group">
            <label htmlFor={name}>
              {label} {required && <span className="required">*</span>}
            </label>
            <input
              type="text"
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
              required={required}
              placeholder={placeholder}
            />
          </div>
        );
    }
  };

  if (submitted) {
    return (
      <section className={`block block-contact-form padding-${padding}`} style={sectionStyle}>
        <div className="container">
          <div className="form-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3>Thank You!</h3>
            <p>{successMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`block block-contact-form padding-${padding}`} style={sectionStyle}>
      <div className="container">
        <div className="contact-form-container">
          {title && <h2 className="block-title">{title}</h2>}
          {description && <p className="form-description">{description}</p>}
          
          {error && (
            <div className="form-error">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-fields">
              {fields.map(renderField)}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : submitButtonText}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactFormBlock;
