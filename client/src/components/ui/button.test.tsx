import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("affiche le label", () => {
    render(<Button>Générer</Button>);
    expect(screen.getByRole("button", { name: "Générer" })).toBeInTheDocument();
  });

  it("applique la variante 'destructive'", () => {
    render(<Button variant="destructive">Supprimer</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/destructive/);
  });

  it("est désactivé quand disabled=true", () => {
    render(<Button disabled>Envoi</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("affiche un spinner et est désactivé quand loading=true", () => {
    render(<Button loading>Chargement</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    // Le spinner est un <span> avec animate-spin
    expect(btn.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("appelle onClick au clic", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Cliquer</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("n'appelle pas onClick si disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Cliquer</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
