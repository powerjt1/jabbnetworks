<script>
  let mobileMenuOpen = $state(false);
  let formData = $state({ name: '', email: '', company: '', message: '' });
  let formSubmitted = $state(false);

  const services = [
    {
      title: 'Power Apps',
      description: 'Build custom business apps with low-code development. From canvas apps to model-driven apps, we create solutions that fit your exact workflow.',
      icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2 2H5V5h14v14zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z'
    },
    {
      title: 'Power Automate',
      description: 'Streamline workflows with intelligent automation. Connect systems, eliminate manual tasks, and boost productivity across your organization.',
      icon: 'M13 3L4 14h5v7l9-11h-5V3z'
    },
    {
      title: 'Power BI',
      description: 'Turn data into actionable insights with interactive dashboards and reports. Make data-driven decisions with real-time analytics.',
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'
    },
    {
      title: 'Copilot Studio',
      description: 'Deploy AI-powered chatbots and virtual agents. Enhance customer and employee experiences with intelligent conversational interfaces.',
      icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'
    }
  ];

  const solutions = [
    { tier: 'Startup', price: 'From $2,500', features: ['Up to 5 Power Apps', 'Basic automation workflows', 'Single data source dashboard', 'Email support'] },
    { tier: 'Small Business', price: 'From $7,500', features: ['Up to 15 Power Apps', 'Advanced Power Automate flows', 'Power BI dashboards & reports', 'Copilot Studio chatbot', 'Priority support'] },
    { tier: 'Mid-Market', price: 'From $20,000', features: ['Unlimited Power Apps', 'Enterprise automation suite', 'Advanced analytics & AI insights', 'Custom Copilot agents', 'Dedicated account manager', 'On-site training'] },
    { tier: 'Enterprise', price: 'Custom', features: ['Full platform deployment', 'Custom connectors & integrations', 'Governance & security setup', 'AI Center of Excellence', '24/7 support & SLA', 'Ongoing optimization'] }
  ];

  function handleSubmit(e) {
    e.preventDefault();
    formSubmitted = true;
    formData = { name: '', email: '', company: '', message: '' };
  }

  function scrollTo(id) {
    mobileMenuOpen = false;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<nav class="navbar">
  <div class="nav-container">
    <a href="#" class="logo" onclick={(e) => { e.preventDefault(); scrollTo('hero'); }}>
      <span class="logo-icon">J</span>
      <span class="logo-text">JABB Networks</span>
    </a>

    <button class="mobile-toggle" onclick={() => mobileMenuOpen = !mobileMenuOpen} aria-label="Toggle menu">
      <span class="hamburger" class:open={mobileMenuOpen}></span>
    </button>

    <ul class="nav-links" class:open={mobileMenuOpen}>
      <li><a href="#about" onclick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a></li>
      <li><a href="#services" onclick={(e) => { e.preventDefault(); scrollTo('services'); }}>Services</a></li>
      <li><a href="#solutions" onclick={(e) => { e.preventDefault(); scrollTo('solutions'); }}>Solutions</a></li>
      <li><a href="#contact" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Contact</a></li>
      <li><a href="#contact" class="nav-cta" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Get Started</a></li>
    </ul>
  </div>
</nav>

<section id="hero" class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <p class="hero-badge">Microsoft Power Platform Partner</p>
    <h1>Power Platform Development<br><span class="gradient-text">From Small to Enterprise</span></h1>
    <p class="hero-subtitle">We build scalable business solutions with Power Apps, Power Automate, Power BI, and Copilot Studio — tailored to your organization's unique needs.</p>
    <div class="hero-actions">
      <a href="#contact" class="btn btn-primary" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Start Your Project</a>
      <a href="#services" class="btn btn-secondary" onclick={(e) => { e.preventDefault(); scrollTo('services'); }}>Explore Services</a>
    </div>
    <div class="hero-stats">
      <div class="stat">
        <span class="stat-number">100+</span>
        <span class="stat-label">Projects Delivered</span>
      </div>
      <div class="stat">
        <span class="stat-number">50+</span>
        <span class="stat-label">Enterprise Clients</span>
      </div>
      <div class="stat">
        <span class="stat-number">98%</span>
        <span class="stat-label">Client Satisfaction</span>
      </div>
    </div>
  </div>
</section>

<section id="about" class="about">
  <div class="container">
    <div class="about-grid">
      <div class="about-content">
        <p class="section-tag">About Us</p>
        <h2>Transforming Businesses with the Microsoft Power Platform</h2>
        <p>JABB Networks specializes in end-to-end Power Platform development. We help organizations of all sizes automate processes, build custom applications, gain data insights, and deploy AI-powered solutions.</p>
        <p>Our team of certified developers and architects delivers solutions that reduce costs, improve efficiency, and drive digital transformation — whether you're a startup or a Fortune 500 enterprise.</p>
        <div class="about-highlights">
          <div class="highlight">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Microsoft Certified Team</span>
          </div>
          <div class="highlight">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Agile Development Process</span>
          </div>
          <div class="highlight">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Ongoing Support & Optimization</span>
          </div>
        </div>
      </div>
      <div class="about-visual">
        <div class="visual-card card-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
          <span>Power Apps</span>
        </div>
        <div class="visual-card card-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 3L4 14h5v7l9-11h-5V3z"/></svg>
          <span>Power Automate</span>
        </div>
        <div class="visual-card card-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
          <span>Power BI</span>
        </div>
        <div class="visual-card card-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          <span>Copilot Studio</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="services" class="services">
  <div class="container">
    <div class="section-header">
      <p class="section-tag">Our Services</p>
      <h2>Full-Spectrum Power Platform Solutions</h2>
      <p class="section-subtitle">We leverage every pillar of the Microsoft Power Platform to deliver comprehensive, integrated solutions.</p>
    </div>
    <div class="services-grid">
      {#each services as service}
        <div class="service-card">
          <div class="service-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d={service.icon}/></svg>
          </div>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
          <a href="#contact" class="service-link" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Learn more →</a>
        </div>
      {/each}
    </div>
  </div>
</section>

<section id="solutions" class="solutions">
  <div class="container">
    <div class="section-header">
      <p class="section-tag">Solutions</p>
      <h2>Scalable Plans for Every Business Size</h2>
      <p class="section-subtitle">From lean startups to complex enterprises — we have the right engagement model for you.</p>
    </div>
    <div class="solutions-grid">
      {#each solutions as solution, i}
        <div class="solution-card" class:featured={i === 2}>
          <div class="solution-header">
            <h3>{solution.tier}</h3>
            <p class="solution-price">{solution.price}</p>
          </div>
          <ul class="solution-features">
            {#each solution.features as feature}
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {feature}
              </li>
            {/each}
          </ul>
          <a href="#contact" class="btn {i === 2 ? 'btn-primary' : 'btn-outline'}" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Get Started</a>
        </div>
      {/each}
    </div>
  </div>
</section>

<section id="contact" class="contact">
  <div class="container">
    <div class="contact-grid">
      <div class="contact-info">
        <p class="section-tag">Get in Touch</p>
        <h2>Ready to Transform Your Business?</h2>
        <p>Tell us about your project and we'll create a tailored solution proposal within 48 hours.</p>
        <div class="contact-details">
          <div class="contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>contact@jabb-networks.com</span>
          </div>
          <div class="contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Serving clients worldwide</span>
          </div>
        </div>
      </div>
      <div class="contact-form-wrapper">
        {#if formSubmitted}
          <div class="form-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <h3>Message Sent!</h3>
            <p>We'll get back to you within 24 hours.</p>
            <button class="btn btn-outline" onclick={() => formSubmitted = false}>Send Another</button>
          </div>
        {:else}
          <form onsubmit={handleSubmit}>
            <div class="form-row">
              <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" bind:value={formData.name} required placeholder="John Smith" />
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" bind:value={formData.email} required placeholder="john@company.com" />
              </div>
            </div>
            <div class="form-group">
              <label for="company">Company</label>
              <input type="text" id="company" bind:value={formData.company} placeholder="Company Name" />
            </div>
            <div class="form-group">
              <label for="message">Project Details</label>
              <textarea id="message" bind:value={formData.message} required rows="5" placeholder="Tell us about your project, goals, and timeline..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-full">Send Message</button>
          </form>
        {/if}
      </div>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo" onclick={(e) => { e.preventDefault(); scrollTo('hero'); }}>
          <span class="logo-icon">J</span>
          <span class="logo-text">JABB Networks</span>
        </a>
        <p>Power Platform development for organizations of every size.</p>
      </div>
      <div class="footer-links">
        <h4>Services</h4>
        <ul>
          <li><a href="#services" onclick={(e) => { e.preventDefault(); scrollTo('services'); }}>Power Apps</a></li>
          <li><a href="#services" onclick={(e) => { e.preventDefault(); scrollTo('services'); }}>Power Automate</a></li>
          <li><a href="#services" onclick={(e) => { e.preventDefault(); scrollTo('services'); }}>Power BI</a></li>
          <li><a href="#services" onclick={(e) => { e.preventDefault(); scrollTo('services'); }}>Copilot Studio</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>Company</h4>
        <ul>
          <li><a href="#about" onclick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a></li>
          <li><a href="#solutions" onclick={(e) => { e.preventDefault(); scrollTo('solutions'); }}>Solutions</a></li>
          <li><a href="#contact" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 JABB Networks. All rights reserved.</p>
    </div>
  </div>
</footer>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1a1a2e;
    background: #ffffff;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  :global(a) {
    text-decoration: none;
    color: inherit;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Navbar */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
    font-size: 1.2rem;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #0078d4, #5c2d91);
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 800;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
    list-style: none;
  }

  .nav-links a {
    font-size: 0.95rem;
    font-weight: 500;
    color: #444;
    transition: color 0.2s;
  }

  .nav-links a:hover {
    color: #0078d4;
  }

  .nav-cta {
    background: linear-gradient(135deg, #0078d4, #5c2d91);
    color: white !important;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .nav-cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,120,212,0.3);
  }

  .mobile-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
  }

  .hamburger {
    display: block;
    width: 24px;
    height: 2px;
    background: #333;
    position: relative;
    transition: background 0.3s;
  }

  .hamburger::before, .hamburger::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 2px;
    background: #333;
    transition: transform 0.3s;
  }

  .hamburger::before { top: -7px; }
  .hamburger::after { top: 7px; }

  .hamburger.open { background: transparent; }
  .hamburger.open::before { transform: rotate(45deg) translate(5px, 5px); }
  .hamburger.open::after { transform: rotate(-45deg) translate(5px, -5px); }

  /* Hero */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
    overflow: hidden;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 30%, #f5f0ff 60%, #fff 100%);
    z-index: 0;
  }

  .hero-bg::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(0,120,212,0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 800px;
  }

  .hero-badge {
    display: inline-block;
    background: rgba(0,120,212,0.1);
    color: #0078d4;
    padding: 8px 20px;
    border-radius: 100px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 24px;
    letter-spacing: 0.5px;
  }

  .hero h1 {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
  }

  .gradient-text {
    background: linear-gradient(135deg, #0078d4, #5c2d91, #0078d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    color: #555;
    max-width: 600px;
    margin: 0 auto 40px;
    line-height: 1.7;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-bottom: 60px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14px 32px;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-family: inherit;
  }

  .btn-primary {
    background: linear-gradient(135deg, #0078d4, #5c2d91);
    color: white;
    box-shadow: 0 4px 14px rgba(0,120,212,0.3);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,120,212,0.4);
  }

  .btn-secondary {
    background: white;
    color: #333;
    border: 1px solid #ddd;
  }

  .btn-secondary:hover {
    border-color: #0078d4;
    color: #0078d4;
  }

  .btn-outline {
    background: transparent;
    color: #0078d4;
    border: 2px solid #0078d4;
  }

  .btn-outline:hover {
    background: #0078d4;
    color: white;
  }

  .btn-full {
    width: 100%;
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 60px;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 800;
    color: #0078d4;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #777;
    margin-top: 4px;
  }

  /* Section shared */
  .section-tag {
    display: inline-block;
    background: rgba(0,120,212,0.1);
    color: #0078d4;
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 16px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .section-header {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 60px;
  }

  .section-header h2, .about-content h2, .contact-info h2 {
    font-size: 2.4rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    line-height: 1.2;
  }

  .section-subtitle {
    color: #666;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  /* About */
  .about {
    padding: 120px 0;
    background: #fafbfe;
  }

  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }

  .about-content p {
    color: #555;
    margin-bottom: 16px;
    font-size: 1.05rem;
    line-height: 1.7;
  }

  .about-highlights {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .highlight {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    color: #333;
  }

  .highlight svg {
    width: 20px;
    height: 20px;
    color: #0078d4;
    flex-shrink: 0;
  }

  .about-visual {
    position: relative;
    height: 360px;
  }

  .visual-card {
    position: absolute;
    background: white;
    border-radius: 16px;
    padding: 24px 28px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    gap: 14px;
    font-weight: 600;
    font-size: 1rem;
    transition: transform 0.3s;
    border: 1px solid rgba(0,0,0,0.04);
  }

  .visual-card:hover {
    transform: translateY(-4px);
  }

  .visual-card svg {
    width: 28px;
    height: 28px;
    color: #0078d4;
  }

  .card-1 { top: 20px; left: 20px; }
  .card-2 { top: 100px; right: 0; }
  .card-3 { bottom: 100px; left: 40px; }
  .card-4 { bottom: 20px; right: 20px; }

  /* Services */
  .services {
    padding: 120px 0;
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .service-card {
    background: white;
    border: 1px solid #eee;
    border-radius: 16px;
    padding: 36px 28px;
    transition: all 0.3s;
  }

  .service-card:hover {
    border-color: #0078d4;
    box-shadow: 0 8px 30px rgba(0,120,212,0.1);
    transform: translateY(-4px);
  }

  .service-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, rgba(0,120,212,0.1), rgba(92,45,145,0.1));
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  .service-icon svg {
    width: 28px;
    height: 28px;
    color: #0078d4;
  }

  .service-card h3 {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .service-card p {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .service-link {
    color: #0078d4;
    font-weight: 600;
    font-size: 0.9rem;
    transition: color 0.2s;
  }

  .service-link:hover {
    color: #5c2d91;
  }

  /* Solutions */
  .solutions {
    padding: 120px 0;
    background: #fafbfe;
  }

  .solutions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .solution-card {
    background: white;
    border: 1px solid #eee;
    border-radius: 16px;
    padding: 36px 28px;
    display: flex;
    flex-direction: column;
    transition: all 0.3s;
  }

  .solution-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  }

  .solution-card.featured {
    border-color: #0078d4;
    box-shadow: 0 8px 30px rgba(0,120,212,0.12);
  }

  .solution-header h3 {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .solution-price {
    font-size: 1.6rem;
    font-weight: 800;
    color: #0078d4;
    margin-bottom: 28px;
  }

  .solution-features {
    list-style: none;
    flex: 1;
    margin-bottom: 28px;
  }

  .solution-features li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    font-size: 0.95rem;
    color: #444;
    border-bottom: 1px solid #f5f5f5;
  }

  .solution-features li:last-child {
    border-bottom: none;
  }

  .solution-features svg {
    width: 18px;
    height: 18px;
    color: #0078d4;
    flex-shrink: 0;
  }

  .solution-card .btn {
    margin-top: auto;
  }

  /* Contact */
  .contact {
    padding: 120px 0;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: start;
  }

  .contact-info p {
    color: #555;
    font-size: 1.1rem;
    line-height: 1.7;
    margin-bottom: 32px;
  }

  .contact-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #555;
  }

  .contact-item svg {
    width: 20px;
    height: 20px;
    color: #0078d4;
    flex-shrink: 0;
  }

  .contact-form-wrapper {
    background: white;
    border: 1px solid #eee;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .form-group input, .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 0.95rem;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: #fafbfe;
  }

  .form-group input:focus, .form-group textarea:focus {
    outline: none;
    border-color: #0078d4;
    box-shadow: 0 0 0 3px rgba(0,120,212,0.1);
  }

  .form-group textarea {
    resize: vertical;
  }

  .form-success {
    text-align: center;
    padding: 40px 20px;
  }

  .form-success svg {
    width: 56px;
    height: 56px;
    color: #0078d4;
    margin-bottom: 20px;
  }

  .form-success h3 {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }

  .form-success p {
    color: #666;
    margin-bottom: 24px;
  }

  /* Footer */
  .footer {
    background: #0a0a1a;
    color: white;
    padding: 80px 0 40px;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 60px;
    margin-bottom: 60px;
  }

  .footer-brand p {
    color: #888;
    margin-top: 16px;
    font-size: 0.95rem;
    max-width: 300px;
  }

  .footer-brand .logo-icon {
    background: linear-gradient(135deg, #0078d4, #5c2d91);
  }

  .footer-brand .logo-text {
    color: white;
  }

  .footer-links h4 {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .footer-links ul {
    list-style: none;
  }

  .footer-links li {
    margin-bottom: 12px;
  }

  .footer-links a {
    color: #888;
    font-size: 0.95rem;
    transition: color 0.2s;
  }

  .footer-links a:hover {
    color: white;
  }

  .footer-bottom {
    border-top: 1px solid #222;
    padding-top: 24px;
    text-align: center;
  }

  .footer-bottom p {
    color: #666;
    font-size: 0.85rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .services-grid, .solutions-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .mobile-toggle {
      display: block;
    }

    .nav-links {
      position: fixed;
      top: 72px;
      left: 0;
      right: 0;
      background: white;
      flex-direction: column;
      padding: 24px;
      gap: 16px;
      border-bottom: 1px solid #eee;
      transform: translateY(-120%);
      transition: transform 0.3s;
    }

    .nav-links.open {
      transform: translateY(0);
    }

    .hero h1 {
      font-size: 2.2rem;
    }

    .hero-subtitle {
      font-size: 1rem;
    }

    .hero-actions {
      flex-direction: column;
      align-items: center;
    }

    .hero-stats {
      flex-direction: column;
      gap: 24px;
    }

    .about-grid, .contact-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .about-visual {
      display: none;
    }

    .services-grid, .solutions-grid {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .footer-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .section-header h2, .about-content h2, .contact-info h2 {
      font-size: 1.8rem;
    }
  }
</style>
