<?php

namespace App\Services;

use RuntimeException;

/**
 * Injects the deliverPrototypeInquiry() hook into a raw prototype export so its
 * booking/demand forms actually reach our backend. Idempotent: re-patching an
 * already-patched file is a no-op, so re-uploading the current live file is safe.
 */
class PrototypeSitePatcher
{
    private const HELPER_MARKER = 'function deliverPrototypeInquiry(';

    private const INSERT_BEFORE = 'function timeLogPublicBookingRequest(){';

    private const OUTBOX_LINE = 'try{const outbox=JSON.parse(localStorage.getItem(PA_LINE_PUBLIC_INQUIRY_OUTBOX_KEY)||"[]");const safe=Array.isArray(outbox)?outbox:[];safe.push(packet);localStorage.setItem(PA_LINE_PUBLIC_INQUIRY_OUTBOX_KEY,JSON.stringify(safe))}catch(e){}';

    private const HELPER_FUNCTION = <<<'JS'
function deliverPrototypeInquiry(packet){
  try{
    const type=(packet.record&&packet.record.sourceKey||"").indexOf("public-demand")===0?"demand":"booking";
    fetch("https://palineofficial.com/api/prototype-inquiries",{
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({type,source_key:packet.record?packet.record.sourceKey:null,contact:packet.contact,lead:packet.lead,record:packet.record,notification:packet.notification})
    }).catch(function(){});
  }catch(e){}
}

JS;

    /**
     * @throws RuntimeException if the expected injection anchors aren't found.
     */
    public function patch(string $html): string
    {
        if (str_contains($html, self::HELPER_MARKER)) {
            return $html;
        }

        if (! str_contains($html, self::INSERT_BEFORE)) {
            throw new RuntimeException('Could not find the '.self::INSERT_BEFORE.' anchor to inject the inquiry-delivery helper.');
        }

        if (! str_contains($html, self::OUTBOX_LINE)) {
            throw new RuntimeException('Could not find the inquiry outbox write to hook into.');
        }

        $html = str_replace(self::INSERT_BEFORE, self::HELPER_FUNCTION.self::INSERT_BEFORE, $html);

        return str_replace(self::OUTBOX_LINE, self::OUTBOX_LINE."\n  deliverPrototypeInquiry(packet);", $html);
    }
}
