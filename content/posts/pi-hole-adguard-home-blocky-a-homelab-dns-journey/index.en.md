---
draft: false
author: jpcercal@gmail.com
slug: pi-hole-adguard-home-blocky-a-homelab-dns-journey
title: "Pi-hole, AdGuard Home, and Blocky: A Homelab DNS Journey"
date: 2026-10-26T00:00:00+00:00
description: I started blocking DNS on a Raspberry Pi with Pi-hole, moved to AdGuard Home, and now run Blocky on my NAS. What each tool is good at, what the community benchmarks actually say, and why a plain config file won.
categories:
  - devops
tags:
  - dns
  - homelab
  - self-hosting
  - pihole
  - adguard-home
  - blocky
---

An ad blocker in your browser only protects that browser. The smart TV, the game console, the IoT bulb that phones home twice a minute: none of them accept extensions. If you want blocking to cover the whole house, the place to enforce it is the resolver.

That is the idea behind network-wide DNS blocking. Every device on the LAN points its DNS at a small service you run, and when something asks for a known ad, tracker, or malware domain, the service answers "does not exist" instead of an address. The request dies before it starts, on every device, with nothing installed anywhere. Three names dominate the self-hosted version of this idea: Pi-hole, AdGuard Home, and Blocky. I have run all three, in that order, and this is what the journey taught me.

## The three tools

**Pi-hole** is the tool that made DNS blocking popular at home. It is a complete web application: a scheduled updater (gravity) pulls blocklists into a local database, a polished admin UI shows query statistics, and client groups apply different policies per device. Version 6 (February 2025) collapsed it into a single process and added native HTTPS on the admin interface.

**AdGuard Home** is a single Go binary with a built-in web UI and encrypted DNS everywhere. It speaks DoH, DoT, and DoQ to upstream resolvers and to LAN clients alike, and adds per-client rules and parental-control filters in the interface.

**Blocky** is the minimalist of the three. A Go DNS proxy configured entirely through YAML: blocklists, upstreams, caching, client groups, local DNS records. No database, no web UI. Instead you get a small HTTP API, Prometheus metrics out of the box, encrypted upstreams (DoH/DoT/DoQ), and CNAME-level blocking that catches aliases of blocked domains.

## My journey

I started the way a lot of people do: Pi-hole on a Raspberry Pi. One install script, a web wizard, and within an hour I had graphs showing how much junk my network had been asking for. It worked for years. What bothered me slowly was the shape of the state. My configuration lived in files, in a database, and in clicks I had made in the UI. Restoring it on a fresh card meant remembering. Then encrypted DNS got harder: Cloudflare deprecated cloudflared's DoH feature in late 2025 (removed February 2026), so Pi-hole needed Unbound or dnscrypt-proxy alongside for an encrypted upstream.

AdGuard Home solved that in one binary. Built-in DoH, a cleaner UI, per-device rules without group gymnastics. I ran it happily for a while, but the underlying shape stayed the same: the truth about my DNS lived inside the application.

The mismatch became obvious when the rest of my homelab moved to TrueNAS and turned into Compose files in a git repository. Every other service was a diff I could review. DNS was the only one I could describe from memory. That is when Blocky clicked, and it has been my resolver since.

## Config as a file, no mystery

Blocky's entire behavior is defined in YAML config. In my homelab repo it is a small directory of files that Blocky merges: upstreams, blocking, caching, custom DNS, rate limits, one concern per file. The whole resolver is versioned, reviewable, and greppable. A change is a commit. Recovery is a clone and a `docker compose up`. If a setting is not in the file, it is not configured; there is no hidden state and no mystery.

The honest trade-off: no UI for a quick allowlist fix at the dinner table. I edit the file, or call the API, and reload. For me that is the feature. For a household that wants click-to-fix, it may not be.

## What the benchmarks actually say

Performance arguments about these tools are everywhere online, and most are worthless: no methodology, no versions, contradictory numbers. The careful measurements converge on a boring conclusion. At home scale all three are fast, and your upstream resolver and cache-hit ratio matter more than the blocker in the middle. WunderTech's long-running hands-on comparison (updated August 2026) puts it plainly: performance is "practically the same", and with identical lists, blocking is a tie.

On throughput, the ferrous-dns project's reproducible dnsperf harness (July 2026) measured 118k QPS for AdGuard Home, 85k for Blocky, and 19.5k for Pi-hole, cache-only; with 1M blocking rules loaded, AdGuard Home (111k) and Blocky (98k) landed within about 13% of each other. It is a vendor benchmark, so I discount its own product's numbers, but the harness is public, and every figure dwarfs what a household generates.

The most instrumented independent test I know is Gino Eising's September 2026 anycast benchmark. AdGuard Home answered warm-cache queries with a p50 of 2.04 ms; Blocky behind Unbound took 11.06 ms with 2.46M regex and wildcard rules loaded. Both stacks hit the 5k QPS test ceiling without losing a query. Ruleset size and regex cost move the latency, not the choice of tool, and 11 ms is still imperceptible at home.

On blocking effectiveness, smarthomeperfected ran Pi-hole and AdGuard Home for a week each on real household traffic (about 600k queries per week, same upstream). AdGuard Home's stock lists blocked 23.2% of queries against 12.2% for a deliberately minimal Pi-hole, but the gap traces almost entirely to list coverage: a single Roku telemetry hostname accounted for 48.7% of AdGuard Home's blocks. Same lists, same blocking, regardless of engine.

Published memory numbers swing by a factor of ten across versions, measurement methods, list sizes, and logging. The ordering is what stays consistent: Blocky is lightest, then AdGuard Home, then Pi-hole, all in the tens to low hundreds of megabytes and irrelevant on any Raspberry Pi 4-class hardware. My Blocky container has a 512 MB cap and never comes close.

## Which one fits your homelab

Setup is easy everywhere: Pi-hole and AdGuard Home ship friendly installers and wizards; Blocky is one binary or container plus a YAML file. If your household needs parental controls and per-device rules from a UI, AdGuard Home fits best. If you want the largest community, the most documentation, and long-term stats in a polished dashboard, Pi-hole still earns its popularity. And if your homelab is already infrastructure-as-code and clicking through a web form to change DNS policy makes you uneasy, Blocky slots in like any other Compose service: config in git, metrics in Prometheus.

None of them will block more ads than the lists you feed them, and none is a bottleneck at home scale. So the decision is usually not about performance at all. It is about where you want the truth about your network to live. I want it in a file I can read, diff, and restore, which is why my answer, after three stops, is Blocky.

## References

1. Gino Eising, "Home DNS failover, taken too far on purpose" (September 2026), independent multi-resolver benchmark: https://djieno.com/blog/home-dns-failover-obsession/
2. ferrous-dns benchmark results (July 2026), reproducible dnsperf harness incl. Pi-hole, AdGuard Home, and Blocky (vendor run): https://github.com/ferrous-networking/ferrous-dns/blob/main/bench/benchmark-results.md
3. SmartHomePerfected, "Pi-hole vs AdGuard Home: We Ran Both for a Week Each" (July 2026): https://www.smarthomeperfected.com/pi-hole-vs-adguard-home/
4. WunderTech (Frank Joseph), "AdGuard Home vs. Pi-hole in 2026" (updated August 2026): https://www.wundertech.net/adguard-home-vs-pi-hole-best-ad-blocker/
5. raspberry.tips, "Pi-hole vs AdGuard Home: Comparison 2026" (October 2026), documentation-based feature matrix: https://raspberry.tips/en/raspberrypi-tutorials/pi-hole-vs-adguard-home-comparison
6. Official docs: Blocky (https://github.com/0xERR0R/blocky), Pi-hole benchmarking guide (https://docs.pi-hole.net/guides/misc/benchmark/), AdGuard Home wiki (https://github.com/AdguardTeam/AdGuardHome/wiki/Comparison)
