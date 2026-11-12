export const pageTemplates = {
  subscriptions: `<main class="site-shell subscription-page">
      <!-- page-clouds -->
      <section
        class="subscription-banner"
        aria-labelledby="subscription-thanks"
      >
        <strong id="subscription-thanks">Thanks!</strong
        ><span class="subscription-subtext">You're on the mailing list</span>
      </section>
      <section
        class="card-section subscription-selection"
        aria-labelledby="subscriptions-heading"
      >
        <!-- form-clouds -->
        <div class="card-block subscription-card">
          <h1 id="subscriptions-heading">{{title}}</h1>
          {{body}}
          <div class="plan-list">
            <button type="button" data-plan="once">
              <span>{{once}}</span><strong>$12</strong
              ><b aria-hidden="true">→</b>
            </button>
            <button type="button" data-plan="monthly">
              <span>{{monthly}}</span><strong>$10/mo</strong
              ><b aria-hidden="true">→</b>
            </button>
            <button type="button" data-plan="yearly">
              <span>{{yearly}}</span><strong>$110/yr</strong
              ><b aria-hidden="true">→</b>
            </button>
          </div>
        </div>
      </section>
      <section class="content-section subscription-copy">{{sections}}</section>
    </main>`,
  donations: `<main class="site-shell subscription-page">
      <!-- page-clouds -->
    <section class="subscription-banner" aria-labelledby="subscription-thanks">
      <strong id="subscription-thanks"></strong><span class="subscription-subtext" id="subscription-type"></span>
    </section>
    <section class="card-section allocate-payment-card" aria-labelledby="allocation-heading">
      <!-- form-clouds -->
      <div class="card-block allocation-card">
        <div class="allocation-unavailable" id="allocation-unavailable" hidden>
          <span>No payment received</span>
        </div>
        <div class="allocation-unavailable" id="allocation-success" hidden>
          <div class="allocation-success-content">
            <span class="allocation-success-title">{{allocationSuccessTitle}}</span>
            <span class="allocation-success-subtext">{{allocationSuccessSubtext}}</span>
            <button class="allocation-change" id="allocation-change" type="button">
              Change Allocation
            </button>
          </div>
        </div>
        <h1 id="allocation-heading">{{title}}</h1>
        <div class="allocation-intro">{{body}}</div>
        <p id="allocation-remaining" class="sr-only" role="status" aria-live="polite"></p>
        <div class="allocation-pool" id="allocation-pool" aria-label="Available percentage bubbles"></div>
        <button class="distribute-randomly" id="distribute-randomly" type="button">
          Distribute Randomly
        </button>
        <div class="allocation-columns">{{columns}}</div>
        <button class="allocation-submit" id="allocation-submit" type="button">
          Submit
        </button>
        <button class="allocation-reset" id="allocation-reset" type="button">
          Reset
        </button>
        <p class="allocation-message" id="allocation-message" role="status" aria-live="polite"></p>
      </div>
    </section>
    <section class="content-section allocate-payment-copy">{{sections}}</section>
  </main>`,
  success: `<main>
      <h1>{{title}}</h1>
      <section class="content-section success-copy">{{sections}}</section>
    </main>`,
};
