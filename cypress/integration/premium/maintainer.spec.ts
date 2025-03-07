describe(
  "Premium tier - Maintainer user",
  {
    defaultCommandTimeout: 20000,
  },
  () => {
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

    it("Can perform the appropriate basic global maintainer actions", () => {
      cy.login("mary@organization.com", "user123#");
      cy.visit("/hosts/manage");
      cy.get(".manage-hosts").should("contain", /hostname/i); // Ensures page load

      // See the "Manage" enroll secret” button. A modal appears after the user selects the button
      cy.contains("button", /manage enroll secret/i).click();
      cy.contains("button", /done/i).click();

      cy.contains("button", /generate installer/i).click();
      // TODO: Check Team Apples is in Select a team dropdown
      cy.contains("button", /done/i).click();

      // Host details page: Can see team UI
      cy.get("tbody").within(() => {
        // Test host text varies
        cy.findByRole("button").click();
      });

      cy.wait(2000); // eslint-disable-line cypress/no-unnecessary-waiting
      cy.findByText("Team").should("exist");
      cy.contains("button", /transfer/i).click();
      cy.get(".Select-control").click();
      cy.findByText(/create a team/i).should("not.exist");
      cy.get(".Select-menu").within(() => {
        cy.findByText(/no team/i).should("exist");
        cy.findByText(/apples/i).should("exist");
        cy.findByText(/oranges/i).click();
      });
      cy.get(".transfer-action-btn").click();
      cy.findByText(/transferred to oranges/i).should("exist");
      cy.findByText(/team/i).next().contains("Oranges");
      cy.contains("button", /delete/i).should("exist");
      cy.contains("button", /query/i).click();
      cy.contains("button", /create custom query/i).should("exist");
      // See and select operating system
      // TODO

      // Query pages: Can see teams UI for create, edit, and run query
      cy.visit("/queries/manage");

      cy.findByRole("button", { name: /create new query/i }).should("exist");

      // TODO - Fix tests according to improved query experience - MP
      // cy.findByRole("button", { name: /create new query/i }).click();

      // cy.get(".target-select").within(() => {
      //   cy.findByText(/Label name, host name, IP address, etc./i).click();
      //   cy.findByText(/teams/i).should("exist");
      // });

      // cy.visit("/queries/manage");

      // cy.findByText(/detect presence/i).click();

      // cy.findByText(/edit & run query/i).should("exist");

      // cy.get(".target-select").within(() => {
      //   cy.findByText(/Label name, host name, IP address, etc./i).click();
      //   cy.findByText(/teams/i).should("exist");
      // });

      // On the policies manage page, they should…
      cy.contains("a", "Policies").click();
      // See and select the "Manage automations" button
      cy.findByRole("button", { name: /manage automations/i }).click();
      cy.findByRole("button", { name: /cancel/i }).click();

      // See and select the "Add a policy", "delete", and "edit" policy
      cy.findByRole("button", { name: /add a policy/i }).click();
      cy.get(".modal__ex").within(() => {
        cy.findByRole("button").click();
      });

      // No global policies seeded, switch to team apples to create, delete, edit
      cy.findByText(/ask yes or no questions/i).should("exist");
      cy.findByText(/all teams/i).click();
      cy.findByText(/apples/i).click();

      cy.get("tbody").within(() => {
        cy.get("tr")
          .first()
          .within(() => {
            cy.get(".fleet-checkbox__input").check({ force: true });
          });
      });
      cy.findByRole("button", { name: /delete/i }).click();
      cy.get(".remove-policies-modal").within(() => {
        cy.findByRole("button", { name: /delete/i }).should("exist");
        cy.findByRole("button", { name: /cancel/i }).click();
      });
      cy.findByText(/filevault enabled/i).click();
      cy.getAttached(".policy-form__button-wrap--new-policy").within(() => {
        cy.findByRole("button", { name: /run/i }).should("exist");
        cy.findByRole("button", { name: /save/i }).should("exist");
      });
      // On the Packs pages (manage, new, and edit), they should…
      // On the Schedule pages (manage, new, and edit), they should…
      // ^^General maintainer functionality for packs page is being tested in free/maintainer.spec.ts

      // On the Profile page, they should…
      // See Global in the Team section and Maintainer in the Role section
      cy.visit("/profile");

      cy.getAttached(".user-settings__additional").within(() => {
        cy.findByText(/team/i)
          .next()
          .contains(/global/i);
        cy.findByText("Role")
          .next()
          .contains(/maintainer/i);
      });
    });
  }
);
