describe("Premium tier - Observer user", () => {
  beforeEach(() => {
    cy.setup();
    cy.login();
    cy.seedPremium();
    cy.seedQueries();
    cy.seedPolicies("apples");
    cy.addDockerHost("apples");
    cy.logout();
  });

  afterEach(() => {
    cy.stopDockerHost();
  });

  it("Can perform the appropriate basic global observer actions", () => {
    cy.login("oliver@organization.com", "user123#");
    // Host manage page: Can see team column
    cy.visit("/hosts/manage");

    // Ensure page is loaded
    cy.wait(3000); // eslint-disable-line cypress/no-unnecessary-waiting
    cy.contains("All hosts");

    // Not see the "Manage enroll secret” or "Generate installer" button
    cy.contains("button", /manage enroll secret/i).should("not.exist");
    cy.contains("button", /generate installer/i).should("not.exist");

    cy.get("thead").within(() => {
      cy.findByText(/team/i).should("exist");
    });

    // Host details page: Can see team on host
    cy.get("tbody").within(() => {
      // Test host text varies
      cy.findByRole("button").click();
    });

    cy.wait(2000); // eslint-disable-line cypress/no-unnecessary-waiting
    cy.findByText("Team").should("exist");
    cy.contains("button", /transfer/i).should("not.exist");
    cy.contains("button", /delete/i).should("not.exist");
    cy.contains("button", /query/i).click();
    cy.contains("button", /create custom query/i).should("not.exist");
    cy.get(".modal__ex").click();

    // See and not select operating system
    // TODO

    // TODO - Fix tests according to improved query experience - MP
    // Query pages: Can see team in select targets dropdown
    // cy.visit("/queries/manage");

    // cy.findByText(/detect presence/i).click();

    // cy.findByRole("button", { name: /run/i }).click();

    // cy.get(".target-select").within(() => {
    //   cy.findByText(/Label name, host name, IP address, etc./i).click();
    //   cy.findByText(/teams/i).should("exist");
    // });

    // On the policies manage page, they should…
    cy.contains("a", "Policies").click();
    // Not see the "Manage automations" button
    cy.findByRole("button", { name: /manage automations/i }).should(
      "not.exist"
    );

    // Cannot see and select the "Add a policy", "delete", and "edit" policy
    cy.findByRole("button", { name: /add a policy/i }).should("not.exist");

    // No global policies seeded, switch to team apples to ensure cannot create, delete, edit
    cy.findByText(/ask yes or no questions/i).should("exist");
    cy.findByText(/all teams/i).click();
    cy.findByText(/apples/i).click();
    cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting

    // Not see the "Add a policy", "delete", "save", "run" policy
    cy.findByRole("button", { name: /add a policy/i }).should("not.exist");

    cy.get("tbody").within(() => {
      cy.get("tr")
        .first()
        .within(() => {
          cy.get(".fleet-checkbox__input").should("not.exist");
        });
    });
    cy.findByText(/filevault enabled/i).click();
    cy.getAttached(".policy-form__wrapper").within(() => {
      cy.findByRole("button", { name: /run/i }).should("not.exist");
      cy.findByRole("button", { name: /save/i }).should("not.exist");
    });
  });

  // Pseudo code for team observer only
  // TODO: Rebuild this test according to new manual QA
  it("Can perform the appropriate basic team observer only actions", () => {
    cy.login("toni@organization.com", "user123#");
    cy.visit("/hosts/manage");
    cy.wait(3000); // eslint-disable-line cypress/no-unnecessary-waiting

    // Ensure the page is loaded and teams are visible
    cy.findByText("Hosts").should("exist");
    cy.contains(".table-container .data-table__table th", "Team").should(
      "be.visible"
    );

    // Nav restrictions
    cy.findByText(/settings/i).should("not.exist");
    cy.findByText(/schedule/i).should("not.exist");
    cy.visit("/settings/organization");
    cy.findByText(/you do not have permissions/i).should("exist");
    cy.visit("/packs/manage");
    cy.findByText(/you do not have permissions/i).should("exist");
    cy.visit("/schedule/manage");
    cy.findByText(/you do not have permissions/i).should("exist");

    // On the policies manage page, they should…
    cy.visit("/policies/manage");

    // Not see and select the "Add a policy", "delete", and "edit" policy
    cy.findByRole("button", { name: /add a policy/i }).should("not.exist");
    cy.findByText(/all teams/i).should("not.exist");
    cy.getAttached("tbody").within(() => {
      cy.get("tr")
        .first()
        .within(() => {
          cy.get(".fleet-checkbox__input").should("not.exist");
        });
      cy.findByText(/filevault enabled/i).click();
    });

    cy.getAttached(".policy-form__wrapper").within(() => {
      cy.findByRole("button", { name: /run/i }).should("not.exist");
      cy.findByRole("button", { name: /save/i }).should("not.exist");
    });

    // On the Profile page, they should…
    // See Global in the Team section and Observer in the Role section
    cy.visit("/profile");

    cy.getAttached(".user-settings__additional").within(() => {
      cy.findByText(/team/i)
        .next()
        .contains(/apples/i);
      cy.findByText("Role")
        .next()
        .contains(/observer/i);
    });
  });
});
