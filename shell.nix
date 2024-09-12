{ pkgs ? import <nixpkgs> {} }:
  let nodePkgs = import ./default.nix {}; # that created by node2nix
  in
  pkgs.mkShell {
    # nativeBuildInputs is usually what you want -- tools you need to run
    nativeBuildInputs = with pkgs.buildPackages; [ nodejs_22 sass ];
}
