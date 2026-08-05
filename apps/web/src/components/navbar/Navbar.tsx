import githubIcon from "@/assets/github.svg";
import logo from "@/assets/zero-sketch-logo.svg";
import { GITHUB_LIBRARY_REPO_URL, LANDING_PAGE_URL } from "@/lib/constants";
import { Badge, Button, LinkButton } from "@cloudflare/kumo";
import { Link } from "@tanstack/react-router";
import { Frame } from "lucide-react";

export const Navbar = () => {
  return (
    <header className="border-b border-kumo-line bg-kumo-neutral-125">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4">
          <Link to={LANDING_PAGE_URL} className="flex items-center gap-2.5">
            <img src={logo} width={40} alt="Logo" />
            <span className="font-bold tracking-tight sm:text-lg text-kumo-default">
              ZeroSketch
            </span>
          </Link>
          <Badge variant="beta" className="size-xs">
            Libraries
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <LinkButton
            href={GITHUB_LIBRARY_REPO_URL}
            external
            variant="outline"
            size="sm"
            className="sm:inline-flex"
            icon={<img src={githubIcon} alt="GitHub" className="size-4" />}
          >
            <span className="hidden sm:inline">GitHub Repo</span>
          </LinkButton>

          <Link to="/">
            <Button
              variant="secondary"
              size="sm"
              icon={<Frame className="size-4" />}
            >
              <span className="hidden sm:inline">Open Canvas</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
