<?php

namespace Tests\Unit\Support;

use App\Support\HtmlSanitizer;
use PHPUnit\Framework\TestCase;

class HtmlSanitizerTest extends TestCase
{
    public function test_it_keeps_allowed_tags(): void
    {
        $result = HtmlSanitizer::sanitize('<p>Hello <strong>world</strong></p>');

        $this->assertSame('<p>Hello <strong>world</strong></p>', $result);
    }

    public function test_it_strips_disallowed_tags_but_keeps_their_text(): void
    {
        $result = HtmlSanitizer::sanitize('<script>alert(1)</script><p onclick="x()">Safe</p>');

        $this->assertStringNotContainsString('<script>', $result);
        $this->assertStringNotContainsString('onclick', $result);
        $this->assertStringContainsString('Safe', $result);
    }

    public function test_it_strips_javascript_hrefs(): void
    {
        $result = HtmlSanitizer::sanitize('<a href="javascript:alert(1)">Click</a>');

        $this->assertStringNotContainsString('javascript:', $result);
    }

    public function test_it_keeps_http_links(): void
    {
        $result = HtmlSanitizer::sanitize('<a href="https://example.com">Click</a>');

        $this->assertStringContainsString('href="https://example.com"', $result);
    }
}
