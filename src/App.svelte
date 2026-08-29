<script>
  import { onMount } from 'svelte';

  let mobileMenuOpen = $state(false);
  let formData = $state({ name: '', email: '', company: '', message: '' });
  let formSubmitted = $state(false);
  let showScrollTop = $state(false);
  let navbarScrolled = $state(false);
  let heroVisible = $state(false);
  let activeService = $state(null);

  const services = [
    {
      title: 'Power Apps',
      description: 'Build custom business apps with low-code development. From canvas apps to model-driven apps, we create solutions that fit your exact workflow.',
      icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2 2H5V5h14v14zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
      color: '#0078d4'
    },
    {
      title: 'Power Automate',
      description: 'Streamline workflows with intelligent automation. Connect systems, eliminate manual tasks, and boost productivity across your organization.',
      icon: 'M13 3L4 14h5v7l9-11h-5V3z',
      color: '#00a36c'
    },
    {
      title: 'Power BI',
      description: 'Turn data into actionable insights with interactive dashboards and reports. Make data-driven decisions with real-time analytics.',
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
      color: '#f2c811'
    },
    {
      title: 'Copilot Studio',
      description: 'Deploy AI-powered chatbots and virtual agents. Enhance customer and employee experiences with intelligent conversational interfaces.',
      icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
      color: '#742774'
    }
  ];

  const processSteps = [
    { num: '01', title: 'Discovery', desc: 'We analyze your business needs, current workflows, and goals to identify the best Power Platform solutions.' },
    { num: '02', title: 'Strategy', desc: 'Our architects design a tailored roadmap with clear milestones, timelines, and ROI projections.' },
    { num: '03', title: 'Development', desc: 'Agile sprints with bi-weekly demos. We build, test, and iterate until every requirement is met.' },
    { num: '04', title: 'Launch & Support', desc: 'Seamless deployment, team training, and ongoing optimization to ensure lasting success.' }
  ];

  const solutions = [
    { tier: 'Startup', price: 2500, period: 'one-time', features: ['Up to 5 Power Apps', 'Basic automation workflows', 'Single data source dashboard', 'Email support'] },
    { tier: 'Small Business', price: 7500, period: 'one-time', features: ['Up to 15 Power Apps', 'Advanced Power Automate flows', 'Power BI dashboards & reports', 'Copilot Studio chatbot', 'Priority support'] },
    { tier: 'Mid-Market', price: 20000, period: 'one-time', features: ['Unlimited Power Apps', 'Enterprise automation suite', 'Advanced analytics & AI insights', 'Custom Copilot agents', 'Dedicated account manager', 'On-site training'], featured: true },
    { tier: 'Enterprise', price: null, period: 'custom', features: ['Full platform deployment', 'Custom connectors & integrations', 'Governance & security setup', 'AI Center of Excellence', '24/7 support & SLA', 'Ongoing optimization'] }
  ];

  let billingCycle = $state('one-time');
  let visibleSections = $state(new Set());
  let animatedNumbers = $state({ projects: 0, clients: 0, satisfaction: 0 });

  const stats = [
    { key: 'projects', target: 100, suffix: '+', label: 'Projects Delivered' },
    { key: 'clients', target: 50, suffix: '+', label: 'Enterprise Clients' },
    { key: 'satisfaction', target: 98, suffix: '%', label: 'Client Satisfaction' }
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

  function animateValue(key, target, duration = 2000) {
    const start = performance.now();
    const initial = 0;
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      animatedNumbers = { ...animatedNumbers, [key]: Math.round(initial + (target - initial) * eased) };
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleSections = new Set([...visibleSections, entry.target.dataset.section]);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));

    const handleScroll = () => {
      showScrollTop = window.scrollY > 600;
      navbarScrolled = window.scrollY > 50;
      if (window.scrollY < 100) heroVisible = false;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    setTimeout(() => heroVisible = true, 100);

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateValue('projects', 100);
          animateValue('clients', 50);
          animateValue('satisfaction', 98);
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });

    const statsEl = document.querySelector('.hero-stats');
    if (statsEl) statsObserver.observe(statsEl);

    return () => {
      observer.disconnect();
      statsObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<!-- NAVBAR -->
<nav class="navbar" class:scrolled={navbarScrolled}>
  <div class="nav-container">
    <a href="javascript:void(0)" class="logo" onclick={() => scrollTo('hero')}>
      <span class="logo-icon">J</span>
      <span class="logo-text">JABB Networks</span>
    </a>

    <button class="mobile-toggle" onclick={() => mobileMenuOpen = !mobileMenuOpen} aria-label="Toggle menu">
      <span class="hamburger" class:open={mobileMenuOpen}></span>
    </button>

    {#if mobileMenuOpen}
      <div class="mobile-backdrop" onclick={() => mobileMenuOpen = false}></div>
    {/if}

    <ul class="nav-links" class:open={mobileMenuOpen}>
      <li><a href="#about" onclick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a></li>
      <li><a href="#services" onclick={(e) => { e.preventDefault(); scrollTo('services'); }}>Services</a></li>
      <li><a href="#process" onclick={(e) => { e.preventDefault(); scrollTo('process'); }}>Process</a></li>
      <li><a href="#solutions" onclick={(e) => { e.preventDefault(); scrollTo('solutions'); }}>Solutions</a></li>
      <li><a href="#contact" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Contact</a></li>
      <li><a href="/mission-control.html" class="nav-tool">Mission Control</a></li>
      <li><a href="/opencoder-lite.html" class="nav-tool">AI Coder</a></li>
      <li><a href="#contact" class="nav-cta" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Get Started</a></li>
    </ul>
  </div>
</nav>

<!-- HERO -->
<section id="hero" class="hero">
  <div class="hero-bg">
    <div class="hero-orb orb-1"></div>
    <div class="hero-orb orb-2"></div>
    <div class="hero-grid"></div>
  </div>
  <div class="hero-content">
    <div class="hero-badge">
      <span class="badge-dot"></span>
      Microsoft Power Platform Partner
    </div>
    <h1>Power Platform Development<br><span class="gradient-text">From Small to Enterprise</span></h1>
    <p class="hero-subtitle">We build scalable business solutions with Power Apps, Power Automate, Power BI, and Copilot Studio — tailored to your organization's unique needs.</p>
    <div class="hero-actions">
      <a href="#contact" class="btn btn-primary btn-lg" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>
        Start Your Project
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
      <a href="#services" class="btn btn-secondary btn-lg" onclick={(e) => { e.preventDefault(); scrollTo('services'); }}>Explore Services</a>
    </div>
    <div class="hero-stats">
      {#each stats as stat}
        <div class="stat">
          <span class="stat-number">{stat.key === 'projects' ? animatedNumbers.projects : stat.key === 'clients' ? animatedNumbers.clients : animatedNumbers.satisfaction}{stat.suffix}</span>
          <span class="stat-label">{stat.label}</span>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- EDITIONS: self-select -->
<section id="editions" class="editions" data-section="editions" class:visible={visibleSections.has('editions')}>
  <div class="container">
    <div class="section-header reveal-up">
      <p class="section-tag">Choose your path</p>
      <h2>Local, Business, or Enterprise</h2>
      <p class="section-subtitle">Start private and free, scale to a managed team platform, or deploy a fully governed edition for regulated organizations.</p>
    </div>
    <div class="editions-grid">
      <div class="edition-card reveal-up">
        <span class="edition-badge">Local</span>
        <h3>Private &amp; free</h3>
        <p>Runs on your device with free local AI models — nothing leaves your machine. The full Mission Control experience, no cloud required.</p>
        <ul class="edition-list">
          <li>Free local models (Ollama / Nemotron)</li>
          <li>Voice, agents, Board Room, offline</li>
          <li>Zero setup, zero cost</li>
        </ul>
        <a href="/mission-control.html" class="btn btn-outline">Open Mission Control</a>
      </div>
      <div class="edition-card featured reveal-up">
        <span class="edition-badge">Business</span>
        <h3>Managed team platform</h3>
        <p>Hosted and managed for your team — managed cloud AI, connectors, and a DLP baseline. The fastest path to value.</p>
        <ul class="edition-list">
          <li>Managed AI + Power Platform connectors</li>
          <li>Shared crew, docs &amp; scheduling</li>
          <li>DLP baseline &amp; SSO</li>
        </ul>
        <a href="#contact" class="btn btn-primary" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Talk to us</a>
      </div>
      <div class="edition-card enterprise reveal-up">
        <span class="edition-badge">Enterprise</span>
        <h3>Governed &amp; compliant</h3>
        <p>Deployed in your Azure tenant and mapped to your controls — Managed Identity, Conditional Access, DLP, Purview, Sentinel, and ALM.</p>
        <ul class="edition-list">
          <li>Azure AI Foundry orchestration</li>
          <li>Entra ID P2, DLP, Purview, Sentinel</li>
          <li>SOC 2 / ISO 27001 / NIST aligned</li>
        </ul>
        <a href="https://github.com/powerjt1/jabb-mission-control/blob/main/docs/enterprise.md" target="_blank" rel="noopener" class="btn btn-outline">Read the architecture ↗</a>
      </div>
    </div>
  </div>
</section>

<!-- ABOUT -->
<section id="about" class="about" data-section="about" class:visible={visibleSections.has('about')}>
  <div class="container">
    <div class="about-grid">
      <div class="about-content reveal-left">
        <p class="section-tag">About Us</p>
        <h2>Transforming Businesses with the Microsoft Power Platform</h2>
        <p>JABB Networks specializes in end-to-end Power Platform development. We help organizations of all sizes automate processes, build custom applications, gain data insights, and deploy AI-powered solutions.</p>
        <p>Our team of certified developers and architects delivers solutions that reduce costs, improve efficiency, and drive digital transformation — whether you're a startup or a Fortune 500 enterprise.</p>
        <div class="about-highlights">
          <div class="highlight">
            <span class="highlight-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>Microsoft Certified Team</span>
          </div>
          <div class="highlight">
            <span class="highlight-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>Agile Development Process</span>
          </div>
          <div class="highlight">
            <span class="highlight-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>Ongoing Support & Optimization</span>
          </div>
        </div>
      </div>
      <div class="about-visual reveal-right">
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

<!-- SERVICES -->
<section id="services" class="services" data-section="services" class:visible={visibleSections.has('services')}>
  <div class="container">
    <div class="section-header reveal-up">
      <p class="section-tag">Our Services</p>
      <h2>Full-Spectrum Power Platform Solutions</h2>
      <p class="section-subtitle">We leverage every pillar of the Microsoft Power Platform to deliver comprehensive, integrated solutions.</p>
    </div>
    <div class="services-grid">
      {#each services as service, i}
        <div
          class="service-card reveal-up"
          style="animation-delay: {0.1 * i}s"
          onmouseenter={() => activeService = i}
          onmouseleave={() => activeService = null}
        >
          <div class="service-icon" style="background: linear-gradient(135deg, {service.color}15, {service.color}08)">
            <svg viewBox="0 0 24 24" fill={service.color}><path d={service.icon}/></svg>
          </div>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
          <a href="#contact" class="service-link" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>
            Learn more
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- PROCESS -->
<section id="process" class="process" data-section="process" class:visible={visibleSections.has('process')}>
  <div class="container">
    <div class="section-header reveal-up">
      <p class="section-tag">Our Process</p>
      <h2>From Vision to Value in 4 Steps</h2>
      <p class="section-subtitle">A proven methodology that delivers results on time and on budget.</p>
    </div>
    <div class="timeline">
      {#each processSteps as step, i}
        <div class="timeline-item reveal-up" style="animation-delay: {0.15 * i}s">
          <div class="timeline-marker">
            <span class="timeline-num">{step.num}</span>
          </div>
          <div class="timeline-content">
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
          {#if i < processSteps.length - 1}
            <div class="timeline-line"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- SOLUTIONS -->
<section id="solutions" class="solutions" data-section="solutions" class:visible={visibleSections.has('solutions')}>
  <div class="container">
    <div class="section-header reveal-up">
      <p class="section-tag">Solutions</p>
      <h2>Scalable Plans for Every Business Size</h2>
      <p class="section-subtitle">From lean startups to complex enterprises — we have the right engagement model for you.</p>
    </div>
    <div class="solutions-grid">
      {#each solutions as solution, i}
        <div class="solution-card reveal-up" class:featured={solution.featured} style="animation-delay: {0.1 * i}s">
          {#if solution.featured}
            <div class="featured-badge">Most Popular</div>
          {/if}
          <div class="solution-header">
            <h3>{solution.tier}</h3>
            <p class="solution-price">
              {#if solution.price}
                <span class="price-currency">$</span>{solution.price.toLocaleString()}
              {:else}
                Custom
              {/if}
            </p>
          </div>
          <ul class="solution-features">
            {#each solution.features as feature}
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {feature}
              </li>
            {/each}
          </ul>
          <a href="#contact" class="btn {solution.featured ? 'btn-primary' : 'btn-outline'}" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>
            {solution.price ? 'Get Started' : 'Contact Us'}
          </a>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CONTACT -->
<section id="contact" class="contact" data-section="contact" class:visible={visibleSections.has('contact')}>
  <div class="container">
    <div class="contact-grid">
      <div class="contact-info reveal-left">
        <p class="section-tag">Get in Touch</p>
        <h2>Ready to Transform Your Business?</h2>
        <p>Tell us about your project and we'll create a tailored solution proposal within 48 hours.</p>
        <div class="contact-details">
          <div class="contact-item">
            <div class="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div>
              <span class="contact-label">Email</span>
              <span>info@jabbnetworks.com</span>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <span class="contact-label">Location</span>
              <span>Serving clients worldwide</span>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <span class="contact-label">Response Time</span>
              <span>Within 24 hours</span>
            </div>
          </div>
        </div>
      </div>
      <div class="contact-form-wrapper reveal-right">
        {#if formSubmitted}
          <div class="form-success">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
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
            <button type="submit" class="btn btn-primary btn-full">
              Send Message
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        {/if}
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="javascript:void(0)" class="logo" onclick={() => scrollTo('hero')}>
          <span class="logo-icon">J</span>
          <span class="logo-text">JABB Networks</span>
        </a>
        <p>Power Platform development for organizations of every size.</p>
        <div class="footer-social">
          <a href="#" aria-label="LinkedIn" class="social-link">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="#" aria-label="Twitter" class="social-link">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>
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
          <li><a href="#process" onclick={(e) => { e.preventDefault(); scrollTo('process'); }}>Process</a></li>
          <li><a href="#solutions" onclick={(e) => { e.preventDefault(); scrollTo('solutions'); }}>Solutions</a></li>
          <li><a href="#contact" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Contact</a></li>
          <li><a href="/mission-control.html">Mission Control</a></li>
          <li><a href="/opencoder-lite.html">AI Coder</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 JABB Networks. All rights reserved.</p>
    </div>
  </div>
</footer>

<!-- SCROLL TO TOP -->
<button class="scroll-top" class:visible={showScrollTop} onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
</button>

<!-- STICKY CTA -->
<div class="sticky-cta" class:visible={showScrollTop}>
  <div class="sticky-cta-inner">
    <span>Ready to get started?</span>
    <a href="#contact" class="btn btn-primary btn-sm" onclick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Free Consultation</a>
  </div>
</div>

<style>
  :global(*) { margin: 0; padding: 0; box-sizing: border-box; }
  :global(html) { scroll-behavior: smooth; }
  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1a1a2e;
    background: #ffffff;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  :global(a) { text-decoration: none; color: inherit; }

  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

  /* ===== REVEAL ANIMATIONS ===== */
  .reveal-up, .reveal-left, .reveal-right {
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  :global(.visible) .reveal-up,
  :global(.visible) .reveal-left,
  :global(.visible) .reveal-right {
    opacity: 1 !important; transform: none !important;
  }

  /* ===== NAVBAR ===== */
  .navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid transparent;
    transition: all 0.3s ease;
  }
  .navbar.scrolled {
    background: rgba(255,255,255,0.95);
    border-bottom-color: rgba(0,0,0,0.06);
    box-shadow: 0 1px 12px rgba(0,0,0,0.04);
  }
  .nav-container {
    max-width: 1200px; margin: 0 auto; padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between; height: 72px;
  }
  .logo { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 1.2rem; }
  .logo-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #0078d4, #5c2d91);
    color: white; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; font-weight: 800;
    transition: transform 0.3s;
  }
  .logo:hover .logo-icon { transform: scale(1.05) rotate(-3deg); }
  .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
  .nav-links a { font-size: 0.95rem; font-weight: 500; color: #444; transition: color 0.2s; position: relative; }
  .nav-links a:not(.nav-cta)::after {
    content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px;
    background: #0078d4; transition: width 0.3s;
  }
  .nav-links a:not(.nav-cta):hover::after { width: 100%; }
  .nav-links a:hover { color: #0078d4; }
  .nav-cta {
    background: linear-gradient(135deg, #0078d4, #5c2d91);
    color: white !important; padding: 10px 24px; border-radius: 8px;
    font-weight: 600; transition: transform 0.2s, box-shadow 0.2s;
  }
  .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,120,212,0.3); }
  .nav-tool {
    background: rgba(34,211,238,0.1); color: #0ea5e9 !important; padding: 10px 20px;
    border-radius: 8px; font-weight: 600; border: 1px solid rgba(34,211,238,0.3);
    transition: all 0.2s;
  }
  .nav-tool:hover { background: #0ea5e9; color: white !important; border-color: #0ea5e9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(14,165,233,0.3); }
  .mobile-toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; z-index: 110; }
  .hamburger { display: block; width: 24px; height: 2px; background: #333; position: relative; transition: background 0.3s; }
  .hamburger::before, .hamburger::after {
    content: ''; position: absolute; width: 24px; height: 2px; background: #333; transition: transform 0.3s;
  }
  .hamburger::before { top: -7px; }
  .hamburger::after { top: 7px; }
  .hamburger.open { background: transparent; }
  .hamburger.open::before { transform: rotate(45deg) translate(5px, 5px); }
  .hamburger.open::after { transform: rotate(-45deg) translate(5px, -5px); }
  .mobile-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.3);
    z-index: 99; backdrop-filter: blur(4px);
  }

  /* ===== HERO ===== */
  .hero {
    position: relative; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    text-align: center; padding: 120px 24px 80px; overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 30%, #f5f0ff 60%, #fff 100%);
    z-index: 0;
  }
  .hero-orb {
    position: absolute; border-radius: 50%; filter: blur(80px);
  }
  .orb-1 {
    width: 600px; height: 600px; top: -200px; right: -100px;
    background: radial-gradient(circle, rgba(0,120,212,0.12) 0%, transparent 70%);
    animation: float 8s ease-in-out infinite;
  }
  .orb-2 {
    width: 400px; height: 400px; bottom: -100px; left: -100px;
    background: radial-gradient(circle, rgba(92,45,145,0.08) 0%, transparent 70%);
    animation: float 10s ease-in-out infinite reverse;
  }
  .hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,120,212,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,120,212,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-30px); }
  }
  .hero-content { position: relative; z-index: 1; max-width: 800px; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(0,120,212,0.1); color: #0078d4;
    padding: 8px 20px; border-radius: 100px;
    font-size: 0.85rem; font-weight: 600; margin-bottom: 24px;
    letter-spacing: 0.5px; opacity: 1; animation: fadeUp 0.6s 0.2s both;
  }
  .badge-dot {
    width: 8px; height: 8px; background: #0078d4; border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.5); }
  }
  .hero h1 {
    font-size: 3.5rem; font-weight: 800; line-height: 1.15;
    margin-bottom: 24px; letter-spacing: -0.02em;
    opacity: 1; animation: fadeUp 0.6s 0.3s both;
  }
  .hero-subtitle {
    font-size: 1.2rem; color: #555; max-width: 600px; margin: 0 auto 40px; line-height: 1.7;
    opacity: 1; animation: fadeUp 0.6s 0.5s both;
  }
  .hero-actions {
    display: flex; gap: 16px; justify-content: center; margin-bottom: 60px;
    opacity: 1; animation: fadeUp 0.6s 0.7s both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .gradient-text {
    background: linear-gradient(135deg, #0078d4, #5c2d91, #0078d4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    background-size: 200% auto; animation: shimmer 3s linear infinite;
  }
  @keyframes shimmer {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  .hero-subtitle {
    font-size: 1.2rem; color: #555; max-width: 600px; margin: 0 auto 40px; line-height: 1.7;
    opacity: 0; animation: fadeUp 0.6s 0.4s forwards;
  }
  .hero-actions {
    display: flex; gap: 16px; justify-content: center; margin-bottom: 60px;
    opacity: 0; animation: fadeUp 0.6s 0.6s forwards;
  }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px; border-radius: 10px; font-size: 1rem; font-weight: 600;
    cursor: pointer; transition: all 0.25s ease; border: none; font-family: inherit;
  }
  .btn-lg { padding: 16px 36px; font-size: 1.05rem; }
  .btn-sm { padding: 10px 20px; font-size: 0.9rem; }
  .btn-primary {
    background: linear-gradient(135deg, #0078d4, #5c2d91);
    color: white; box-shadow: 0 4px 14px rgba(0,120,212,0.3);
  }
  .btn-primary:hover {
    transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,120,212,0.4);
  }
  .btn-primary:active { transform: translateY(0); }
  .btn-secondary { background: white; color: #333; border: 1px solid #ddd; }
  .btn-secondary:hover { border-color: #0078d4; color: #0078d4; background: #f8fbff; }
  .btn-outline { background: transparent; color: #0078d4; border: 2px solid #0078d4; }
  .btn-outline:hover { background: #0078d4; color: white; }
  .btn-full { width: 100%; justify-content: center; }
  .hero-stats {
    display: flex; justify-content: center; gap: 60px;
    opacity: 1; animation: fadeUp 0.6s 0.9s both;
  }
  .stat { display: flex; flex-direction: column; }
  .stat-number { font-size: 2.2rem; font-weight: 800; color: #0078d4; font-variant-numeric: tabular-nums; }
  .stat-label { font-size: 0.85rem; color: #777; margin-top: 4px; }

  /* ===== SECTION SHARED ===== */
  .section-tag {
    display: inline-block; background: rgba(0,120,212,0.1); color: #0078d4;
    padding: 6px 16px; border-radius: 100px; font-size: 0.8rem; font-weight: 600;
    margin-bottom: 16px; letter-spacing: 0.5px; text-transform: uppercase;
  }
  .section-header { text-align: center; max-width: 600px; margin: 0 auto 60px; }
  .section-header h2, .about-content h2, .contact-info h2 {
    font-size: 2.4rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 16px; line-height: 1.2;
  }
  .section-subtitle { color: #666; font-size: 1.1rem; line-height: 1.6; }

  /* ===== EDITIONS ===== */
  .editions { padding: 120px 0; }
  .editions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .edition-card {
    position: relative; background: white; border: 1px solid #eee; border-radius: 16px;
    padding: 36px 28px; display: flex; flex-direction: column;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .edition-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); border-color: #0078d4; }
  .edition-card.featured { border-color: #0078d4; box-shadow: 0 8px 30px rgba(0,120,212,0.12); }
  .edition-card.enterprise { background: linear-gradient(160deg, #0a0a1a, #12122a); color: #fff; border-color: #2a2a4a; }
  .edition-card.enterprise h3 { color: #fff; }
  .edition-card.enterprise p { color: #b8c0e0; }
  .edition-badge {
    align-self: flex-start; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px;
    text-transform: uppercase; padding: 4px 12px; border-radius: 100px; margin-bottom: 16px;
    background: rgba(0,120,212,0.1); color: #0078d4;
  }
  .edition-card.enterprise .edition-badge { background: linear-gradient(135deg, #22d3ee, #a78bfa); color: #04070d; }
  .edition-card h3 { font-size: 1.3rem; font-weight: 800; margin-bottom: 10px; }
  .edition-card > p { font-size: 0.95rem; line-height: 1.6; margin-bottom: 18px; color: #555; }
  .edition-list { list-style: none; padding: 0; margin: 0 0 24px; flex: 1; }
  .edition-list li { font-size: 0.9rem; padding: 7px 0 7px 22px; position: relative; }
  .edition-list li::before { content: '✓'; position: absolute; left: 0; color: #0078d4; font-weight: 700; }
  .edition-card.enterprise .edition-list li::before { color: #22d3ee; }
  .edition-card .btn { margin-top: auto; justify-content: center; width: 100%; }

  /* ===== ABOUT ===== */
  .about { padding: 120px 0; background: #fafbfe; }
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .about-content p { color: #555; margin-bottom: 16px; font-size: 1.05rem; line-height: 1.7; }
  .about-highlights { margin-top: 32px; display: flex; flex-direction: column; gap: 16px; }
  .highlight { display: flex; align-items: center; gap: 14px; font-weight: 500; color: #333; }
  .highlight-icon {
    width: 36px; height: 36px; background: rgba(0,120,212,0.1); border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .highlight-icon svg { width: 18px; height: 18px; color: #0078d4; }
  .about-visual { position: relative; height: 360px; }
  .visual-card {
    position: absolute; background: white; border-radius: 16px; padding: 24px 28px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.08); display: flex; align-items: center;
    gap: 14px; font-weight: 600; font-size: 1rem; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid rgba(0,0,0,0.04);
  }
  .visual-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
  .visual-card svg { width: 28px; height: 28px; color: #0078d4; }
  .card-1 { top: 20px; left: 20px; animation: floatCard 6s ease-in-out infinite; }
  .card-2 { top: 100px; right: 0; animation: floatCard 7s ease-in-out infinite 0.5s; }
  .card-3 { bottom: 100px; left: 40px; animation: floatCard 8s ease-in-out infinite 1s; }
  .card-4 { bottom: 20px; right: 20px; animation: floatCard 6.5s ease-in-out infinite 1.5s; }
  @keyframes floatCard {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  /* ===== SERVICES ===== */
  .services { padding: 120px 0; }
  .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
  .service-card {
    background: white; border: 1px solid #eee; border-radius: 16px; padding: 36px 28px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden;
  }
  .service-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(135deg, #0078d4, #5c2d91);
    transform: scaleX(0); transform-origin: left; transition: transform 0.4s;
  }
  .service-card:hover::before { transform: scaleX(1); }
  .service-card:hover { border-color: #0078d4; box-shadow: 0 12px 40px rgba(0,120,212,0.12); transform: translateY(-6px); }
  .service-icon {
    width: 56px; height: 56px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
    transition: transform 0.3s;
  }
  .service-card:hover .service-icon { transform: scale(1.1) rotate(-3deg); }
  .service-icon svg { width: 28px; height: 28px; }
  .service-card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 12px; }
  .service-card p { color: #666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px; }
  .service-link {
    color: #0078d4; font-weight: 600; font-size: 0.9rem;
    display: inline-flex; align-items: center; gap: 6px; transition: gap 0.3s;
  }
  .service-link:hover { gap: 10px; }

  /* ===== PROCESS ===== */
  .process { padding: 120px 0; background: #0a0a1a; color: white; }
  .process .section-tag { background: rgba(0,120,212,0.2); }
  .process .section-subtitle { color: #aaa; }
  .timeline { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; position: relative; }
  .timeline-item { position: relative; text-align: center; padding-top: 60px; }
  .timeline-marker {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 48px; height: 48px; border-radius: 50%;
    background: linear-gradient(135deg, #0078d4, #5c2d91);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(0,120,212,0.4);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .timeline-item:hover .timeline-marker {
    transform: translateX(-50%) scale(1.15);
    box-shadow: 0 6px 30px rgba(0,120,212,0.5);
  }
  .timeline-num { font-size: 0.85rem; font-weight: 700; color: white; }
  .timeline-content { padding: 0 8px; }
  .timeline-content h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 8px; }
  .timeline-content p { color: #aaa; font-size: 0.9rem; line-height: 1.6; }
  .timeline-line {
    position: absolute; top: 23px; left: calc(50% + 28px); right: -32px;
    height: 2px; background: linear-gradient(90deg, #0078d4, rgba(0,120,212,0.2));
  }

  /* ===== SOLUTIONS ===== */
  .solutions { padding: 120px 0; background: #fafbfe; }
  .solutions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
  .solution-card {
    background: white; border: 1px solid #eee; border-radius: 16px; padding: 36px 28px;
    display: flex; flex-direction: column; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
  }
  .solution-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
  .solution-card.featured {
    border-color: #0078d4;
    box-shadow: 0 8px 30px rgba(0,120,212,0.12);
  }
  .solution-card.featured::before {
    content: ''; position: absolute; inset: -1px; border-radius: 16px;
    background: linear-gradient(135deg, #0078d4, #5c2d91); z-index: -1;
    opacity: 0; transition: opacity 0.3s;
  }
  .solution-card.featured:hover::before { opacity: 1; }
  .featured-badge {
    position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #0078d4, #5c2d91); color: white;
    padding: 4px 16px; border-radius: 100px; font-size: 0.75rem; font-weight: 600;
    white-space: nowrap;
  }
  .solution-header h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
  .solution-price { font-size: 1.8rem; font-weight: 800; color: #0078d4; margin-bottom: 28px; }
  .price-currency { font-size: 1.2rem; vertical-align: super; }
  .solution-features { list-style: none; flex: 1; margin-bottom: 28px; }
  .solution-features li {
    display: flex; align-items: center; gap: 10px; padding: 10px 0;
    font-size: 0.95rem; color: #444; border-bottom: 1px solid #f5f5f5;
  }
  .solution-features li:last-child { border-bottom: none; }
  .solution-features svg { width: 18px; height: 18px; color: #0078d4; flex-shrink: 0; }
  .solution-card .btn { margin-top: auto; justify-content: center; }

  /* ===== CONTACT ===== */
  .contact { padding: 120px 0; }
  .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
  .contact-info p { color: #555; font-size: 1.1rem; line-height: 1.7; margin-bottom: 32px; }
  .contact-details { display: flex; flex-direction: column; gap: 20px; }
  .contact-item { display: flex; align-items: flex-start; gap: 16px; }
  .contact-icon {
    width: 44px; height: 44px; background: rgba(0,120,212,0.1); border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .contact-icon svg { width: 20px; height: 20px; color: #0078d4; }
  .contact-label { display: block; font-size: 0.8rem; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .contact-item span:last-child { color: #444; }
  .contact-form-wrapper {
    background: white; border: 1px solid #eee; border-radius: 20px; padding: 40px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.06); transition: box-shadow 0.3s;
  }
  .contact-form-wrapper:focus-within { box-shadow: 0 12px 40px rgba(0,120,212,0.1); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group { margin-bottom: 20px; }
  .form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #333; margin-bottom: 8px; }
  .form-group input, .form-group textarea {
    width: 100%; padding: 12px 16px; border: 2px solid #eee; border-radius: 10px;
    font-size: 0.95rem; font-family: inherit; transition: all 0.3s; background: #fafbfe;
  }
  .form-group input:focus, .form-group textarea:focus {
    outline: none; border-color: #0078d4; box-shadow: 0 0 0 4px rgba(0,120,212,0.1);
    background: white;
  }
  .form-group textarea { resize: vertical; }
  .form-success { text-align: center; padding: 40px 20px; }
  .success-icon {
    width: 72px; height: 72px; background: rgba(0,120,212,0.1); border-radius: 50%;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
    animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
  .success-icon svg { width: 36px; height: 36px; color: #0078d4; }
  .form-success h3 { font-size: 1.5rem; margin-bottom: 8px; }
  .form-success p { color: #666; margin-bottom: 24px; }

  /* ===== FOOTER ===== */
  .footer { background: #0a0a1a; color: white; padding: 80px 0 40px; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 60px; margin-bottom: 60px; }
  .footer-brand p { color: #888; margin-top: 16px; font-size: 0.95rem; max-width: 300px; }
  .footer-brand .logo-icon { background: linear-gradient(135deg, #0078d4, #5c2d91); }
  .footer-brand .logo-text { color: white; }
  .footer-social { display: flex; gap: 12px; margin-top: 20px; }
  .social-link {
    width: 40px; height: 40px; background: rgba(255,255,255,0.08); border-radius: 10px;
    display: flex; align-items: center; justify-content: center; transition: all 0.3s;
  }
  .social-link:hover { background: #0078d4; transform: translateY(-2px); }
  .social-link svg { width: 18px; height: 18px; color: white; }
  .footer-links h4 {
    font-size: 0.9rem; font-weight: 600; margin-bottom: 20px; color: #aaa;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .footer-links ul { list-style: none; }
  .footer-links li { margin-bottom: 12px; }
  .footer-links a { color: #888; font-size: 0.95rem; transition: all 0.2s; }
  .footer-links a:hover { color: white; padding-left: 4px; }
  .footer-bottom { border-top: 1px solid #222; padding-top: 24px; text-align: center; }
  .footer-bottom p { color: #666; font-size: 0.85rem; }

  /* ===== SCROLL TO TOP ===== */
  .scroll-top {
    position: fixed; bottom: 100px; right: 24px; z-index: 90;
    width: 48px; height: 48px; border-radius: 50%; border: none;
    background: linear-gradient(135deg, #0078d4, #5c2d91); color: white;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(0,120,212,0.3);
    opacity: 0; transform: translateY(20px); transition: all 0.3s;
    pointer-events: none;
  }
  .scroll-top.visible { opacity: 1; transform: translateY(0); pointer-events: all; }
  .scroll-top:hover { transform: translateY(-3px); box-shadow: 0 6px 24px rgba(0,120,212,0.4); }
  .scroll-top svg { width: 24px; height: 24px; }

  /* ===== STICKY CTA ===== */
  .sticky-cta {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
    background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
    border-top: 1px solid rgba(0,0,0,0.06);
    transform: translateY(100%); transition: transform 0.3s;
  }
  .sticky-cta.visible { transform: translateY(0); }
  .sticky-cta-inner {
    max-width: 1200px; margin: 0 auto; padding: 12px 24px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .sticky-cta span { font-weight: 600; color: #333; }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 1024px) {
    .services-grid, .solutions-grid, .timeline { grid-template-columns: repeat(2, 1fr); }
    .timeline-line { display: none; }
  }
  @media (max-width: 768px) {
    .mobile-toggle { display: block; }
    .nav-links {
      position: fixed; top: 0; right: 0; bottom: 0; width: 280px;
      background: white; flex-direction: column; padding: 80px 32px 32px; gap: 20px;
      transform: translateX(100%); transition: transform 0.3s ease;
      box-shadow: -4px 0 20px rgba(0,0,0,0.1); z-index: 100;
    }
    .nav-links.open { transform: translateX(0); }
    .nav-links a { font-size: 1.1rem; }
    .hero h1 { font-size: 2.2rem; }
    .hero-subtitle { font-size: 1rem; }
    .hero-actions { flex-direction: column; align-items: center; }
    .hero-stats { flex-direction: column; gap: 24px; }
    .about-grid, .contact-grid { grid-template-columns: 1fr; gap: 40px; }
    .about-visual { display: none; }
    .services-grid, .solutions-grid, .timeline, .editions-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 40px; }
    .section-header h2, .about-content h2, .contact-info h2 { font-size: 1.8rem; }
    .sticky-cta span { font-size: 0.9rem; }
  }
</style>
