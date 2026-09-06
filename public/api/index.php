<?php
require __DIR__ . '/config.php';
require __DIR__ . '/lib/response.php';

json_ok([
    'name' => 'Sai Desert Camp & Resort CMS API',
    'endpoints' => [
        'auth' => '/api/auth.php?action=session|login|logout|change-password|setup',
        'content' => '/api/content.php?type={site-settings|navigation|pages|packages|rooms|activities|gallery|testimonials|faqs|blogs}',
        'media' => '/api/media.php',
        'enquiries' => '/api/enquiries.php',
        'backup' => '/api/backup.php?action=list|create|download|restore',
    ],
]);
