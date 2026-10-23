---
draft: false
author: jpcercal@gmail.com
slug: php2shell-two-critical-php-vulnerabilities
title: "PHP2Shell: Two Critical PHP Vulnerabilities and What to Do Now"
date: 2026-10-21T00:00:00+00:00
description: Two critical flaws in the PHP runtime, CVE-2026-109618 and CVE-2026-109619, can allow unauthenticated remote code execution. Here is what the advisories and public reports say, how a WAF and layered controls help, and how to patch PHP and your Docker images.
categories:
  - news
tags:
  - php
  - security
  - devops
---

Two critical vulnerabilities in the PHP runtime itself were disclosed on October 21, 2026: CVE-2026-109618 and CVE-2026-109619, nicknamed “PHP2Shell.” Both are rated CVSS 9.2 (v4.0) and both can lead to unauthenticated remote code execution. The disclosure was moved up from October 22 after the CVE IDs leaked on October 20 ([PHP Foundation](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/)).

This is not a bug in a framework or a plugin. It is in PHP core, so it does not matter whether you run WordPress, Laravel, Symfony, Zend or a ten-year-old script.

I updated this post after reading the two GitHub security advisories, the PHP Foundation write-up and the vendor pages linked in the references.

**The short version:** update PHP to 8.5.12, 8.4.27, 8.3.36 or 8.2.35, restart every worker, and check the version that is actually running. A WAF can buy you time but it is not a patch. Below: how the flaws work, what a WAF and defense in depth can and cannot do (with a mitigation map and an Akamai example), how to patch PHP and the Docker images, how to verify, and the sources.

## What is affected

The fixed releases are **PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35**. Both CVEs are fixed by the same releases. Anything older than those on the same branch is affected.

For older branches the sources differ, and this is the uncomfortable part:

- The GitHub advisories ([GHSA-w8hw-w9fx-j79w](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w) and [GHSA-6wmf-4rv5-p3rp](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)) list the 8.2 to 8.5 branches.
- Google Cloud says “all versions of PHP from 5.4 through 8.5.11” are vulnerable ([Google Cloud](https://cloud.google.com/blog/products/identity-security/responding-to-core-php-vulnerabilities-cve-2026-109618-cve-2026-109619)).
- Upstream PHP ships no release for 8.1 or earlier. The security team did publish minimal source backports for 7.4, 8.0 and 8.1 as branches in php-src, for people who build from source and have no LTS vendor (links in [the patching section](#patch-php)).
- Some vendors ship backported packages for older branches: Ubuntu lists fixed packages from 14.04 through 26.10 (the oldest releases via Ubuntu Pro), and Zend lists ZendPHP builds for 7.2, 7.3, 7.4 and 8.1. Zend’s page says the flaw affects all PHP 5, 7 and 8.0/8.1 versions ([Ubuntu](https://ubuntu.com/security/CVE-2026-109618), [Zend](https://www.zend.com/php-security-center/CVE-2026-109618)).

So if you are on 8.1, 7.x or 5.x, there is no upstream release. You either get a vendor backport, build from the backport branch, or migrate to a supported branch. Treat the vendor route as a bridge, not a plan.

## How the flaws work

The advisories describe two different memory-lifecycle bugs. I am keeping this at the level the advisories publish and leaving out payload details on purpose.

**CVE-2026-109618, “RCE via OOM corruption.”** PHP uses `longjmp()` to bail out of a request when it runs out of memory. In some contexts, request memory is reachable before it is fully initialized. If an allocation fails at that point, the request is left in an invalid state, and request shutdown then reads or branches on it. The failing allocation does not need to be related to the invalid memory.

The advisory lists several ways to run a request out of memory while staying inside its apparent limits, all around multipart parsing: a multipart body without a usable declared content length that slips past `post_max_size`, parts with an unlimited number of headers, and empty file controls that do not count toward `max_file_uploads` but still build metadata arrays.

**CVE-2026-109619, “RCE via stale global state.”** A persistent worker keeps some global state (error, session, object, extension state) that points at memory owned by one request. If a fatal error, including an out-of-memory one, interrupts the request before that state is reset, the heap is freed while the worker still refers to it. A later operation that runs before normal request initialization can then use the stale pointer: a use-after-free. It needs a producer and a consumer, and in the demonstrated cases they are different HTTP requests handled by the same worker.

The confirmed consumers are INI diagnostics raised before request initialization and session upload progress. `session.upload_progress.enabled` is on by default and no `session_start()` call is needed. The strongest demonstrated case is PHP 8.5 with `fatal_error_backtraces` enabled.

### Impact depends on the SAPI

- **Apache mod_php** is the worst case for 109618: request shutdown runs even when startup failed, so the flaw is reachable before any application code runs. RCE was demonstrated over HTTP with default memory and input limits. The 109619 backtrace case was also confirmed against mod_php.
- **PHP-FPM** exits a child when request startup fails, which blunts the simplest sequence. The advisories describe it as susceptible through application-level paths. For 109619 a session-lifecycle RCE was validated on FPM, but it needs a suitable application operation. For 109618 the advisory says no complete FPM exploit has been demonstrated, while the PHP Foundation says RCE was confirmed on FPM through application-level code paths.
- **FrankenPHP** is likely susceptible to 109618 by source analysis, and **LSAPI** is a conditional candidate. Neither was validated.

The confirmed impact is unauthenticated code execution as the web worker account. For 109619 the advisory also lists heap use-after-free and memory disclosure. Reliability depends on the PHP build, extensions, frontend and allocator layout.

## Is it being exploited?

- One of the reporting firms published a proof-of-concept video by mistake after the leak, and copies have been circulating since. The PHP security team says it went through the PoCs that surfaced and found no functional exploit at the time of release ([PHP Foundation](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/))
- watchTowr tells a different story: it reports exploitation attempts in the wild from October 21, along with a PoC tool called “PHP2Shell” making the rounds ([watchTowr](https://watchtowr.com/intelligence/php-remote-code-execution-php2shell/)). Even if you weigh that as one vendor’s account, the safe move is to plan as if exploitation is active.
- Public repositories claiming to hold detection rules or indicators are already out there. Treat them with caution before putting anything from them into your tooling.

## Reduce exposure at the edge: WAF and defense in depth

**A WAF is a compensating control, not a fix.** The bug is in the PHP interpreter. A rule at the edge does not update PHP, does not help if the origin is reachable around the edge, and only matches request shapes someone has already seen. Akamai says the same in its own write-up: “the most effective defense continues to be the prompt application of vendor patches” ([Akamai](https://www.akamai.com/blog/security-research/critical-remote-code-execution-vulnerabilities-php-core)). Use the controls below to buy time, shrink the blast radius and notice if something got through. The patch comes in the next section. For the general case, see my post [A WAF Is Not a Patch]({{< ref "posts/a-waf-is-not-a-patch/index.en.md" >}} "A WAF Is Not a Patch").

### The map

The six layers below are the whole defense. Traffic crosses five of them top to bottom and every layer reports into the sixth. Only layer 4 removes the vulnerability. Layers 1 to 3 reduce the chance that a hostile request reaches the multipart parser, layer 5 limits what a compromised worker can do, and layer 6 is how you find out the others failed.

![Defense layers for PHP2Shell: edge WAF, reverse proxy, application, PHP runtime (the patch), container and infrastructure, monitoring](defense-layers.en.svg "Defense layers for PHP2Shell. Only the PHP runtime layer, the patch, removes the vulnerability.")

Each layer maps to a security-by-design principle:

| Layer | What it does | Principle |
|---|---|---|
| 1. Edge (WAF) | Managed rule, custom virtual patch, rate limits, origin lock-down | Defense in depth, fail safe. An independent control in front of the app, and the origin lock-down stops the edge being bypassed. |
| 2. Proxy / web server | Hard caps on size, parts, headers, nesting; reject multipart without a usable length | Secure defaults, fail safe. The PHP advisory itself says to cap these at the frontend. The limits hold even if the WAF is misconfigured. |
| 3. Application | Authenticated, CSRF-protected uploads only where needed; validated input; fail closed | Least privilege. Anonymous users never reach multipart paths they do not need. On mod_php, CVE-2026-109618 triggers before application code runs, so this layer reduces exposure but does not close it. |
| 4. PHP runtime | Patch, restart, interim ini changes | Patch management. The only layer that fixes the root cause. The interim ini changes are partial. |
| 5. Container / infrastructure | Rebuild, non-root, read-only filesystem, memory limit, egress filter, scoped secrets | Least privilege, blast-radius reduction. Assume the parser can be compromised: a worker that cannot spawn tools, write to disk or reach the network is worth little to an attacker. |
| 6. Monitoring / response | Events to a SIEM, host telemetry, a runbook | Observability. Rules will have gaps, and detection time bounds the damage. |

### Akamai as the worked example

I use Akamai App and API Protector because it is the vendor whose guidance I read for this. Akamai released Adaptive Security Engine rule **3000991 v1** (“PHP Remote Code Execution Attack Detected (CVE-2026-109618, CVE-2026-109619)”) and says its existing command-injection rules mitigate weaponized payloads. The same logic carries over to other WAFs.

One limit on what follows. Menu names and available match conditions vary by contract and product version, so confirm each one in your own Control Center.

**1. Prerequisites.** Identify the security policies and hostnames that front PHP applications, because rules attach to policies and a missed hostname is an unprotected app. Identify which paths legitimately accept `multipart/form-data`: everything else is a candidate for “no multipart”. Confirm the origin cannot be reached around Akamai (step 6) before anything else.

**2. Confirm the managed protection is on, and in Deny.** Find rule 3000991 in the policy’s Adaptive Security Engine view and check that its action is Deny, not Alert. Akamai says App and API Protector customers are protected, but its post does not state the per-policy default action, so do not assume it. Turn on auto-update of Rapid Rules, or review new rules daily during the incident. Keep the command injection, web attack tool, web protocol attack and file inclusion groups in Deny: they matter for what happens after a payload lands, not for the memory-corruption trigger itself. Google Cloud recommends the equivalent categories for Cloud Armor. If you need an exception, scope it to one path and one rule, never a whole group.

**3. Custom rules as a virtual patch, in Alert first.** Aim to shrink the reachable multipart surface using only conditions an edge can evaluate reliably.

| Rule | Purpose | Confidence |
|---|---|---|
| A. Multipart outside the allow-list | Deny `multipart/form-data` POSTs to any path that does not need uploads | Strong: header and path only |
| B. Chunked multipart | Alert, then deny, `multipart/form-data` with `Transfer-Encoding: chunked` or no `Content-Length` | Strong, if none of your clients send chunked uploads. This is my inference from the advisory, not an advisory recommendation |
| C. Oversize multipart | Deny multipart whose `Content-Length` is above the per-path cap | Strong for the declared length, silent about decoded size |
| D. Upload-progress field | Alert on the `PHP_SESSION_UPLOAD_PROGRESS` field name in the body | Weak: limited by body inspection, not needed by CVE-2026-109618, easily renamed |
| E. Oversized-body gap | Alert on multipart bodies larger than the WAF’s inspection limit | Closes the “the WAF never read it” blind spot (Google Cloud suggests the same kind of rule) |

**4. Rate controls.** Add a rate policy for POSTs to multipart-capable paths, keyed by client IP. CVE-2026-109619 needs a producer request followed by a consumer request, so bursts are a usable signal. Start from your observed peak legitimate rate, not a guessed number, and start in Alert.

**5. Roll out from Alert to Deny, and test.** The order is the point:

1. Baseline: log the current multipart traffic for two to seven days if you can.
2. Deploy the custom rules in Alert.
3. Review events daily, grouped by rule, path, client and user agent.
4. On a false positive, scope or fix the rule. Never disable the group.
5. When a rule has been clean for the period you chose, promote it to Deny, one rule at a time, lowest risk first.
6. Watch the 4xx rate, the upload success rate and support tickets. On a regression, go back to Alert and keep the evidence.
7. Keep the rules until PHP is patched everywhere, then retire them or keep them as hardening.

Expect false positives from large legitimate uploads, bulk forms with many array fields, upload-progress bars and clients that send chunked multipart. Keep a short list of known-good clients (mobile apps, integrations) and test them before each promotion to Deny.

Do not run exploit code or the public PoC to test your rules, in production or in staging. It can be malicious, and a successful test crashes or compromises workers. Use benign synthetic requests against a staging hostname in the same policy. These are examples to adapt; the hostnames and paths are placeholders:

```shell
# Multipart POST to a path that should NOT accept multipart (expect rule A to fire)
curl -sS -o /dev/null -w '%{http_code}\n' -F 'a=1' https://staging.example.com/api/no-uploads-here

# Chunked multipart (expect rule B to fire)
curl -sS -o /dev/null -w '%{http_code}\n' -H 'Transfer-Encoding: chunked' \
  -F 'file=@small.txt' https://staging.example.com/upload
```

Then look up each test in Security Events by the reference number on the deny page and confirm the intended rule fired with the intended action.

**6. Lock down the origin.** Without this, everything above is optional for an attacker. Allow origin traffic only from Akamai (Site Shield, or an origin firewall allow-list of Akamai ranges plus a shared secret or mTLS where available), because an origin that accepts direct traffic bypasses the WAF completely. Verify from an outside network that the origin IP does not answer, and review DNS history and old hostnames that may still point straight at it.

**7. Logging and SIEM.** Send security events and delivery logs (DataStream) to your SIEM, including request ID, hostname, path, method, client IP, `Content-Type`, `Content-Length`, `Transfer-Encoding`, response code, matched rule IDs and actions. Useful detections to adapt:

- Any hit on rule 3000991 or on custom rules A to E, grouped by client and path.
- Multipart POST count per path per hour against your baseline.
- Spikes in 5xx from PHP origins within minutes of a multipart burst, which looks like worker crashes.
- A client that sent an alerted request and then a second request to the same host within seconds, the producer and consumer pattern of CVE-2026-109619.

Correlate with host telemetry: a shell or unexpected child process spawned by php-fpm or Apache workers is a compromise indicator, not a WAF event.

## Patch PHP

Updating is the only complete fix. The WAF, proxy limits and ini tweaks only buy time. Upgrade to **8.5.12, 8.4.27, 8.3.36 or 8.2.35** ([php.net](https://www.php.net/archive/2026.php#2026-10-21-5)). On 8.1 or older there is no upstream release: use a vendor backport, the source backports ([7.4](https://github.com/php/php-src/tree/PHP-7.4-CVE-2026-109618-109619), [8.0](https://github.com/php/php-src/tree/PHP-8.0-CVE-2026-109618-109619), [8.1](https://github.com/php/php-src/tree/PHP-8.1-CVE-2026-109618-109619)), or migrate.

Distro packages keep the old version number and backport the fix, so check your vendor's tracker ([Debian](https://security-tracker.debian.org/tracker/CVE-2026-109618), [Ubuntu](https://ubuntu.com/security/CVE-2026-109618), [Red Hat](https://access.redhat.com/security/cve/cve-2026-109618)), not `php -v`. For Docker, pin the fixed tag (for example `php:8.5.12-fpm-alpine`), ideally by digest too, and rebuild with `docker build --pull --no-cache`. Image scanners can miss these CVEs, because PHP in the official images is not a system package.

Then restart every PHP-FPM, Apache and worker process, and verify what is actually running: `php -v` and `php-fpm -v` on each host and in each container. In CI, fail the build when `PHP_VERSION` is below the fixed release for its branch.

Roll out by exposure, internet-facing `mod_php` first, and prefer rolling forward to rolling back. If you suspect a compromise, rotate secrets and rebuild from clean images.

If you run PHP 8.1 or older, how long will your migration take?

**References:** [GHSA-w8hw-w9fx-j79w](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w), [GHSA-6wmf-4rv5-p3rp](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp), [PHP Foundation](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/), [Google Cloud](https://cloud.google.com/blog/products/identity-security/responding-to-core-php-vulnerabilities-cve-2026-109618-cve-2026-109619), [Akamai](https://www.akamai.com/blog/security-research/critical-remote-code-execution-vulnerabilities-php-core), [watchTowr](https://watchtowr.com/intelligence/php-remote-code-execution-php2shell/).
