import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import {
  VelocityComponent,
  VelocityTransitionGroup,
  velocityHelpers
} from "velocity-react";
import { Button } from "/imports/plugins/core/ui/client/components";
import { Components } from "@reactioncommerce/reaction-components";

const ROTATION_SPEED = 5000;

const Animations = {
  // Register these with UI Pack so that we can use stagger later.
  In: velocityHelpers.registerEffect({
    calls: [
      [
        {
          transformPerspective: [800, 800],
          transformOriginX: ["50%", "50%"],
          transformOriginY: ["100%", "100%"],
          marginBottom: 0,
          opacity: 1,
          rotateX: [0, 130]
        },
        1,
        {
          easing: "ease-out",
          display: "block"
        }
      ]
    ]
  }),

  Out: velocityHelpers.registerEffect({
    calls: [
      [
        {
          transformPerspective: [800, 800],
          transformOriginX: ["50%", "50%"],
          transformOriginY: ["0%", "0%"],
          marginBottom: -30,
          opacity: 0,
          rotateX: -70
        },
        1,
        {
          easing: "ease-out",
          display: "block"
        }
      ]
    ]
  })
};

const Answers = {
  everyCustomer: [
    "Check out our next Beer Release",
    "Share a pic on social… tag us and we will re-post",
    "You bought a Saison last time, a fresh batch is ready at the taproom!",
    "Check-in on Untappd",
    "We have leftover inventory on sale now",
    "Do you have any suggestions?"
  ],
  bestCustomers: [
    "Give us a five-star review",
    "Join us for a private tasting with the Brewer",
    "Join our loyalty program",
    "Refer your friends and get free brewery swag"
  ]
};

const FEATURES = [{
  icon: "at",
  title: "Customer Engagement",
  description: "Get the name and email address of every customer"
}, {
  icon: "exclamation-triangle",
  title: "FOMO & Urgency",
  description: "Capitalize on customer excitement by taking orders as soon as you announce"
}, {
  icon: "users",
  title: "Network Effects",
  description: "Sharing on Facebook, Instagram, Twitter, and Untappd helps spread the word"
}, {
  icon: "thumbs-up",
  title: "Reviews",
  description: "Follow up with customers to garner reviews on Facebook, Yelp, Google, and Foursquare"
}, {
  icon: "line-chart",
  title: "Data Analysis",
  description: "Learn more about your customers"
}, {
  icon: "cogs",
  title: "Inventory Control",
  description: "Set limits, Schedule pickup times"
}];

const initialAnswerIndexes = {};
Object.keys(Answers).forEach((key) => {
  initialAnswerIndexes[key] = 0;
});

export default class About extends Component {
  static propTypes = {
    onNextStep: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.intervalPtr = {};
    this.state = {
      currentAnswerIndexes: initialAnswerIndexes,
      duration: 500
    };
  }

  componentDidMount() {
    Object.keys(Answers).forEach((key, inx, keys) => {
      const delay = ROTATION_SPEED * inx / keys.length;
      setTimeout(() => this.resumeInterval(key), delay);
    });
  }

  componentWillUnmount() {
    Object.keys(this.intervalPtr).forEach((key) => this.pauseInterval(key));
  }

  resumeInterval = (questionKey) => {
    if (this.intervalPtr[questionKey]) { return; }

    this.intervalPtr[questionKey] =
      setInterval(() => this.rotateAnswers(questionKey), ROTATION_SPEED);
  }

  pauseInterval = (questionKey) => {
    clearInterval(this.intervalPtr[questionKey]);
    this.intervalPtr[questionKey] = null;
  }

  renderHero() {
    return (
      <div className="hero-wrapper">
        <h1 className="hero-title">
          Brewline: the Beer Release platform made for Craft Brewers
        </h1>

        <div className="hero-content">
          <p className="large">
            We all know that beer releases are a great way to move product, test
            new lines, and build excitement for your beer.
            Take it to the next level with Brewline.
          </p>

          {this.renderButton()}
        </div>
      </div>
    );
  }

  rotateAnswers = (questionKey) => {
    const { currentAnswerIndexes } = this.state;
    const currentIndex = currentAnswerIndexes[questionKey];

    currentAnswerIndexes[questionKey] =
      (currentIndex + 1) % Answers[questionKey].length;

    this.setState({ currentAnswerIndexes });
  }

  renderAnswers(questionKey) {
    const answer =
      Answers[questionKey][this.state.currentAnswerIndexes[questionKey]];
    const answers = [
      <p className="teaser-answer" key={answer}>
        &ldquo;{answer}&rdquo;
      </p>
    ];

    const enterAnimation = {
      animation: Animations.In,
      stagger: this.state.duration,
      duration: this.state.duration,
      backwards: true,
      display: "block",
      style: {
        // Since we're staggering, we want to keep the display at "none" until Velocity runs
        // the display attribute at the start of the animation.
        display: "none"
      }
    };

    const leaveAnimation = {
      animation: Animations.Out,
      stagger: this.state.duration,
      duration: this.state.duration,
      backwards: true
    };

    return (
      <div
        className="teaser-answers"
        onMouseOver={() => this.pauseInterval(questionKey)}
        onFocus={() => this.pauseInterval(questionKey)}
        onMouseOut={() => this.resumeInterval(questionKey)}
        onBlur={() => this.resumeInterval(questionKey)}
      >
        <VelocityTransitionGroup
          component="div"
          className="flex-1 teaser-answer-container"
          enter={enterAnimation}
          leave={leaveAnimation}
        >
          {answers}
        </VelocityTransitionGroup>

        {/* TODO: add bar which grows over time and resets on the interval */}
      </div>
    );
  }

  renderTeaserEveryCustomer() {
    const questionKey = "everyCustomer";

    return (
      <div className="teaser every-customer">
        <div className="teaser-question">
          {" if you could "}

          <span className="primary">
            contact every customer
          </span>

          {" from your can releases, "}

          <br />

          <span className="secondary">
            what would you say to them?
          </span>
        </div>

        {this.renderAnswers(questionKey)}
      </div>
    );
  }

  renderTeaserBestCustomers() {
    const questionKey = "bestCustomers";

    return (
      <div className="teaser best-customers">
        <div className="teaser-question">
          {" what if you had a list of your "}

          <span className="primary">
            best customers
          </span>

          {" based on sales data… "}

          <br />

          <span className="secondary">
            what would you say then?
          </span>
        </div>

        {this.renderAnswers(questionKey)}
      </div>
    );
  }

  renderTeasers() {
    return (
      <div className="teasers-container">
        <div className="teasers">
          {this.renderTeaserEveryCustomer()}

          <Components.Divider
            id="auth-divider"
            label="and then..."
          />

          {this.renderTeaserBestCustomers()}
        </div>
      </div>
    );
  }

  renderFeatures() {
    return (
      <div className="features-wrapper">
        <div className="features-content">
          <h3>All the features you need</h3>

          <div className="features">
            <div className="row">
              {_.map(FEATURES, (feature, index) => (
                <div
                  className="col-sm-12 col-md-6 media"
                  key={index}
                >
                  <div className="media-left">
                    <i className={`icon fa fa-4x pull-left fa-${feature.icon}`} />
                  </div>
                  <div className="media-body">
                    <h4 className="media-heading">{feature.title}</h4>
                    <p>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCta() {
    return (
      <div className="cta-wrapper">
        <p>
          Ready to start your next beer release online?
        </p>

        {this.renderButton()}
      </div>
    );
  }

  renderButton() {
    return (
      <div className="button-with-annotation">
        <VelocityComponent animation="callout.shake" runOnMount={true}>
          <Button
            bezelStyle="solid"
            className={{
              "btn": true,
              "btn-lg": true,
              "btn-success": true
            }}
            label="Set up my brewery"
            onClick={this.props.onNextStep}
            primary={true}
          />
        </VelocityComponent>

        <em className="annotation">{"(done in minutes)"}</em>
      </div>
    );
  }

  render() {
    return (
      <Fragment>
        {this.renderTeasers()}

        <div className="onboarding__step brewline-onboarding__about">
          {this.renderHero()}

          {this.renderFeatures()}

          {this.renderCta()}
        </div>
      </Fragment>
    );
  }
}
