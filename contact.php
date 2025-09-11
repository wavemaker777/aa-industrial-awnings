<?php
$to = getenv('AA_CONTACT_TO') ?: 'sales@example.com';
$subject = "AA Industrial Awnings Quote Request";
function sanitize($s){ return trim(strip_tags($s ?? "")); }
$name = sanitize($_POST['name'] ?? '');
$email = sanitize($_POST['email'] ?? '');
$message = sanitize($_POST['message'] ?? '');
if ($name && $email && $message){
  $row = [date('c'), $name, $email, preg_replace('/\s+/', ' ', $message)];
  $fp = fopen(__DIR__ . "/submissions.csv", "a"); if ($fp){ fputcsv($fp, $row); fclose($fp); }
  $headers = "From: no-reply@{$_SERVER['HTTP_HOST']}\r\n"."Reply-To: {$email}\r\n"."Content-Type: text/plain; charset=UTF-8\r\n";
  @mail($to, $subject, "Name: $name\nEmail: $email\n\n$message", $headers);
  header("Location: /?sent=1#contact"); exit;
} else { header("Location: /?error=1#contact"); exit; }
