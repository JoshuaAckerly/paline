<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Minimal allow-list HTML sanitizer for admin-authored legal document content
 * rendered to the public Review & Sign flow. Defense in depth only — content is
 * already admin-trusted, but this strips anything beyond basic rich text/tables.
 */
final class HtmlSanitizer
{
    /** @var array<string, list<string>> */
    private const ALLOWED_TAGS = [
        'p' => [], 'br' => [], 'strong' => [], 'b' => [], 'em' => [], 'i' => [], 'u' => [],
        'ul' => [], 'ol' => [], 'li' => [], 'blockquote' => [],
        'h1' => [], 'h2' => [], 'h3' => [], 'h4' => [],
        'table' => [], 'thead' => [], 'tbody' => [], 'tr' => [], 'td' => [], 'th' => [],
        'span' => [], 'a' => ['href'],
    ];

    public static function sanitize(string $html): string
    {
        $document = new DOMDocument();
        libxml_use_internal_errors(true);
        $document->loadHTML(
            '<?xml encoding="utf-8"?><div>'.$html.'</div>',
            LIBXML_NOERROR | LIBXML_NOWARNING,
        );
        libxml_clear_errors();

        $root = $document->getElementsByTagName('div')->item(0);

        if ($root === null) {
            return '';
        }

        self::cleanNode($document, $root);

        $inner = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $inner .= $document->saveHTML($child);
        }

        return trim($inner);
    }

    private static function cleanNode(DOMDocument $document, DOMNode $node): void
    {
        $children = iterator_to_array($node->childNodes);

        foreach ($children as $child) {
            if (! $child instanceof DOMElement) {
                continue;
            }

            $tag = strtolower($child->tagName);

            if (! array_key_exists($tag, self::ALLOWED_TAGS)) {
                self::unwrap($document, $child);

                continue;
            }

            foreach (iterator_to_array($child->attributes ?? []) as $attribute) {
                if (! in_array(strtolower($attribute->nodeName), self::ALLOWED_TAGS[$tag], true)) {
                    $child->removeAttribute($attribute->nodeName);
                } elseif (strtolower($attribute->nodeName) === 'href'
                    && ! str_starts_with($attribute->nodeValue, 'http')) {
                    $child->removeAttribute('href');
                }
            }

            self::cleanNode($document, $child);
        }
    }

    private static function unwrap(DOMDocument $document, DOMElement $element): void
    {
        while ($element->firstChild !== null) {
            $element->parentNode?->insertBefore($element->firstChild, $element);
        }

        $element->parentNode?->removeChild($element);
    }
}
