import React from "react";
import { render, screen } from "@testing-library/react";
import ParseMentions from "../ParseMentions";

describe("ParseMentions", () => {
  const renderMentions = (text, map) => {
    render(<div>{ParseMentions(text, map)}</div>);
  };

  it("renders plain text with no mentions", () => {
    renderMentions("This is a plain sentence.", {});
    expect(screen.getByText("This is a plain sentence.")).toBeInTheDocument();
  });

  it("renders a single mention as a link when company exists", () => {
    const companyMap = { AcmeCorp: "/timeline/acmecorp" };
    const { container } = render(
      <div>
        {ParseMentions("Partnered with @AcmeCorp on sourcing.", companyMap)}
      </div>
    );

    const links = container.querySelectorAll("a");
    expect(links.length).toBe(1);
    expect(links[0].textContent).toBe("@AcmeCorp");
    expect(links[0].getAttribute("href")).toBe("/timeline/acmecorp");
  });

  it("renders a single mention as plain text when company is missing", () => {
    renderMentions("Partnered with @UnknownCo on sourcing.", {});

    const mention = screen.getByText((content, element) => {
      return element.tagName !== "A" && content.includes("@UnknownCo");
    });
    expect(mention).toBeInTheDocument();
  });

  it("renders multiple mentions with mixed links and plain text", () => {
    const companyMap = {
      GreenSupply: "/timeline/greensupply",
      EcoWorks: "/timeline/ecoworks",
    };

    const text =
      "We worked with @GreenSupply and @UnknownCo before joining @EcoWorks.";
    renderMentions(text, companyMap);

    expect(screen.getByRole("link", { name: /@EcoWorks/i })).toHaveAttribute(
      "href",
      "/timeline/ecoworks"
    );

    expect(
      screen.getByText((content, element) => {
        return element.tagName !== "A" && content.includes("@GreenSupply");
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText((content, element) => {
        return element.tagName !== "A" && content.includes("@UnknownCo");
      })
    ).toBeInTheDocument();
  });

  it("handles company names with spaces and hyphens", () => {
    const companyMap = {
      "Green Supply Co": "/timeline/greensupplyco",
      "Eco-Works": "/timeline/ecoworks",
    };

    const text = "Mentions: @Green Supply Co and @Eco-Works.";
    renderMentions(text, companyMap);

    expect(screen.getByRole("link", { name: /@Eco-Works/i })).toHaveAttribute(
      "href",
      "/timeline/ecoworks"
    );

    expect(
      screen.getByText((content, element) => {
        return element.tagName !== "A" && content.includes("@Green Supply Co");
      })
    ).toBeInTheDocument();
  });
});
