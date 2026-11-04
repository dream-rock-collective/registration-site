export const pageTemplates = {
  subscriptions: `<main class="site-shell subscription-page">
      <img class="cloud cloud-a" src="/cloud.png" alt="" /><img
        class="cloud cloud-b"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-c" src="/cloud.png" alt="" /><img
        class="cloud cloud-d"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-e" src="/cloud.png" alt="" /><img
        class="cloud cloud-f"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-g" src="/cloud.png" alt="" /><img
        class="cloud cloud-h"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-i" src="/cloud.png" alt="" /><img
        class="cloud cloud-j"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-k" src="/cloud.png" alt="" /><img
        class="cloud cloud-l"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-m" src="/cloud.png" alt="" /><img
        class="cloud cloud-n"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-o" src="/cloud.png" alt="" /><img
        class="cloud cloud-p"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-q" src="/cloud.png" alt="" /><img
        class="cloud cloud-r"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-s" src="/cloud.png" alt="" /><img
        class="cloud cloud-t"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-u" src="/cloud.png" alt="" /><img
        class="cloud cloud-v"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-w" src="/cloud.png" alt="" /><img
        class="cloud cloud-x"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-y" src="/cloud.png" alt="" /><img
        class="cloud cloud-z"
        src="/cloud.png"
        alt=""
      /><img class="cloud cloud-aa" src="/cloud.png" alt="" /><img
        class="cloud cloud-cluster-a"
        src="/3-cloud-cluster.png"
        alt=""
      /><img
        class="cloud cloud-cluster-b"
        src="/3-cloud-cluster.png"
        alt=""
      /><img
        class="cloud cloud-cluster-c"
        src="/3-cloud-cluster.png"
        alt=""
      />
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
        <img class="cloud cloud-form-left" src="/cloud.png" alt="" /><img
          class="cloud cloud-form-right"
          src="/cloud.png"
          alt=""
        /><img class="cloud cloud-form" src="/cloud.png" alt="" />
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
    <img class="cloud cloud-a" src="/cloud.png" alt="" /><img class="cloud cloud-b" src="/cloud.png" alt="" /><img
      class="cloud cloud-c" src="/cloud.png" alt="" /><img class="cloud cloud-d" src="/cloud.png" alt="" /><img
      class="cloud cloud-e" src="/cloud.png" alt="" /><img class="cloud cloud-f" src="/cloud.png" alt="" /><img
      class="cloud cloud-g" src="/cloud.png" alt="" /><img class="cloud cloud-h" src="/cloud.png" alt="" /><img
      class="cloud cloud-i" src="/cloud.png" alt="" /><img class="cloud cloud-j" src="/cloud.png" alt="" /><img
      class="cloud cloud-k" src="/cloud.png" alt="" /><img class="cloud cloud-l" src="/cloud.png" alt="" /><img
      class="cloud cloud-m" src="/cloud.png" alt="" /><img class="cloud cloud-n" src="/cloud.png" alt="" /><img
      class="cloud cloud-o" src="/cloud.png" alt="" /><img class="cloud cloud-p" src="/cloud.png" alt="" /><img
      class="cloud cloud-q" src="/cloud.png" alt="" /><img class="cloud cloud-r" src="/cloud.png" alt="" /><img
      class="cloud cloud-s" src="/cloud.png" alt="" /><img class="cloud cloud-t" src="/cloud.png" alt="" /><img
      class="cloud cloud-u" src="/cloud.png" alt="" /><img class="cloud cloud-v" src="/cloud.png" alt="" /><img
      class="cloud cloud-w" src="/cloud.png" alt="" /><img class="cloud cloud-x" src="/cloud.png" alt="" /><img
      class="cloud cloud-y" src="/cloud.png" alt="" /><img class="cloud cloud-z" src="/cloud.png" alt="" /><img
      class="cloud cloud-aa" src="/cloud.png" alt="" /><img class="cloud cloud-cluster-a" src="/3-cloud-cluster.png"
      alt="" /><img class="cloud cloud-cluster-b" src="/3-cloud-cluster.png" alt="" /><img class="cloud cloud-cluster-c"
      src="/3-cloud-cluster.png" alt="" />
    <section class="subscription-banner" aria-labelledby="subscription-thanks">
      <strong id="subscription-thanks"></strong><span class="subscription-subtext" id="subscription-type"></span>
    </section>
    <section class="card-section allocate-payment-card" aria-labelledby="allocation-heading">
      <img class="cloud cloud-form-left" src="/cloud.png" alt="" /><img class="cloud cloud-form-right" src="/cloud.png"
        alt="" /><img class="cloud cloud-form" src="/cloud.png" alt="" />
      <div class="card-block allocation-card">
        <div class="allocation-unavailable" id="allocation-unavailable" hidden>
          <span>No payment received</span>
        </div>
        <div class="allocation-unavailable" id="allocation-success" hidden>
          <div class="allocation-success-content">
            <span class="allocation-success-title">You&rsquo;re all set!</span>
            <span class="allocation-success-subtext">A letter will be arriving to your address this month</span>
            <button class="allocation-change" id="allocation-change" type="button">
              Change Allocation
            </button>
          </div>
        </div>
        <h1 id="allocation-heading">{{title}}</h1>
        <div class="allocation-intro">{{body}}</div>
        <div class="allocation-pool" id="allocation-pool" aria-label="Available dollars"></div>
        <button class="distribute-randomly" id="distribute-randomly" type="button">
          Distrubte Randomly
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
    </main>`,
};
