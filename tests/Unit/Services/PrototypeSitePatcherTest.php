<?php

namespace Tests\Unit\Services;

use App\Services\PrototypeSitePatcher;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class PrototypeSitePatcherTest extends TestCase
{
    private function unpatchedFixture(): string
    {
        return <<<'HTML'
<html><body><script>
function timeLogPublicBookingRequest(){
  try{const outbox=JSON.parse(localStorage.getItem(PA_LINE_PUBLIC_INQUIRY_OUTBOX_KEY)||"[]");const safe=Array.isArray(outbox)?outbox:[];safe.push(packet);localStorage.setItem(PA_LINE_PUBLIC_INQUIRY_OUTBOX_KEY,JSON.stringify(safe))}catch(e){}
}
</script></body></html>
HTML;
    }

    public function test_it_injects_the_helper_function_and_call_sites(): void
    {
        $patched = (new PrototypeSitePatcher())->patch($this->unpatchedFixture());

        $this->assertStringContainsString('function deliverPrototypeInquiry(packet){', $patched);
        $this->assertStringContainsString('https://palineofficial.com/api/prototype-inquiries', $patched);
        $this->assertSame(1, substr_count($patched, 'deliverPrototypeInquiry(packet);'));
    }

    public function test_it_is_idempotent_when_run_twice(): void
    {
        $patcher = new PrototypeSitePatcher();

        $once = $patcher->patch($this->unpatchedFixture());
        $twice = $patcher->patch($once);

        $this->assertSame($once, $twice);
        $this->assertSame(1, substr_count($twice, 'function deliverPrototypeInquiry('));
    }

    public function test_it_throws_when_the_expected_anchor_is_missing(): void
    {
        $this->expectException(RuntimeException::class);

        (new PrototypeSitePatcher())->patch('<html><body>nothing recognizable here</body></html>');
    }
}
