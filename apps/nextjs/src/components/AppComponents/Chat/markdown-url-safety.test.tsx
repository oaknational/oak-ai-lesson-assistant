/**
 * @jest-environment jsdom
 */
import type { Components } from "react-markdown";

import { render, screen } from "@testing-library/react";

import { wrapWithUrlSafety } from "./markdown-url-safety";

describe("wrapWithUrlSafety", () => {
  describe("anchor component", () => {
    it("renders a safe https link through the underlying component", () => {
      const components: Partial<Components> = {
        a: ({ href, children }) => (
          <a href={href} data-testid="inner-a">
            {children}
          </a>
        ),
      };
      const wrapped = wrapWithUrlSafety(components);
      const A = wrapped.a!;

      render(<A href="https://example.com">link</A>);
      const link = screen.getByTestId("inner-a");
      expect(link).toHaveAttribute("href", "https://example.com");
    });

    it("renders a safe relative link through the underlying component", () => {
      const components: Partial<Components> = {
        a: ({ href, children }) => (
          <a href={href} data-testid="inner-a">
            {children}
          </a>
        ),
      };
      const wrapped = wrapWithUrlSafety(components);
      const A = wrapped.a!;

      render(<A href="/aila">new lesson</A>);
      const link = screen.getByTestId("inner-a");
      expect(link).toHaveAttribute("href", "/aila");
    });

    it("blocks javascript: URLs and renders text as a span", () => {
      const components: Partial<Components> = {
        a: ({ href, children }) => (
          <a href={href} data-testid="inner-a">
            {children}
          </a>
        ),
      };
      const wrapped = wrapWithUrlSafety(components);
      const A = wrapped.a!;

      render(<A href="javascript:alert(1)">XSS</A>);
      expect(screen.queryByTestId("inner-a")).toBeNull();
      expect(screen.getByText("XSS").tagName.toLowerCase()).toBe("span");
    });

    it("blocks data: URIs", () => {
      const components: Partial<Components> = {
        a: ({ href, children }) => (
          <a href={href} data-testid="inner-a">
            {children}
          </a>
        ),
      };
      const wrapped = wrapWithUrlSafety(components);
      const A = wrapped.a!;

      render(<A href="data:text/html,<script>alert(1)</script>">XSS</A>);
      expect(screen.queryByTestId("inner-a")).toBeNull();
    });

    it("blocks mixed-case javascript: URLs", () => {
      const components: Partial<Components> = {
        a: ({ href, children }) => (
          <a href={href} data-testid="inner-a">
            {children}
          </a>
        ),
      };
      const wrapped = wrapWithUrlSafety(components);
      const A = wrapped.a!;

      render(<A href="JaVaScRiPt:alert(1)">XSS</A>);
      expect(screen.queryByTestId("inner-a")).toBeNull();
    });

    it("falls back to a plain anchor when no underlying component is provided", () => {
      const wrapped = wrapWithUrlSafety({});
      const A = wrapped.a!;

      render(<A href="https://example.com">link</A>);
      const link = screen.getByRole("link", { name: "link" });
      expect(link).toHaveAttribute("href", "https://example.com");
    });
  });

  describe("img component", () => {
    it("passes a safe https src to the underlying component", () => {
      const components: Partial<Components> = {
        img: ({ src, alt }) => (
          <img src={src} alt={alt} data-testid="inner-img" />
        ),
      };
      const wrapped = wrapWithUrlSafety(components);
      const Img = wrapped.img!;

      render(<Img src="https://example.com/cat.png" alt="cat" />);
      const img = screen.getByTestId("inner-img");
      expect(img).toHaveAttribute("src", "https://example.com/cat.png");
    });

    it("blocks javascript: image sources", () => {
      const components: Partial<Components> = {
        img: ({ src, alt }) => (
          <img src={src} alt={alt} data-testid="inner-img" />
        ),
      };
      const wrapped = wrapWithUrlSafety(components);
      const Img = wrapped.img!;

      render(<Img src="javascript:alert(1)" alt="cat" />);
      expect(screen.queryByTestId("inner-img")).toBeNull();
      expect(screen.getByText("cat")).toBeInTheDocument();
    });

    it("blocks data: image sources", () => {
      const components: Partial<Components> = {
        img: ({ src, alt }) => (
          <img src={src} alt={alt} data-testid="inner-img" />
        ),
      };
      const wrapped = wrapWithUrlSafety(components);
      const Img = wrapped.img!;

      render(<Img src="data:text/html,..." alt="xss" />);
      expect(screen.queryByTestId("inner-img")).toBeNull();
    });

    it("renders an empty span when an unsafe img src has no alt", () => {
      const wrapped = wrapWithUrlSafety({});
      const Img = wrapped.img!;

      const { container } = render(<Img src="javascript:alert(1)" />);
      expect(container.querySelector("img")).toBeNull();
    });
  });
});
