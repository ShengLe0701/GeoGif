<?php

namespace App\Api\V1\Controllers;

use JWTAuth;
use Validator;
use DB;
use Config;
use Illuminate\Http\Request;
use Illuminate\Mail\Message;
use Dingo\Api\Routing\Helpers;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Password;
use Tymon\JWTAuth\Exceptions\JWTException;
use Dingo\Api\Exception\ValidationHttpException;
class AWSBucketController extends Controller
{
    use Helpers;
    /////////////////////////get uploading //////////////////////////////////
      public function getUploadingToken(){
          $bucket_name = 'geogif';
          $aws_access_key_id = 'AKIAIRPFNWDYLAEXMKZQ';
          $aws_secret_key  = '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';
          $now = time() + (12 * 60 * 60 * 1000);
          $expire = gmdate('Y-m-d\TH:i:s\Z', $now);

          $url = 'https://s3-ap-southeast-1.amazonaws.com/'.$bucket_name.'/image';
          $policy_document = '
              {"expiration": "' . $expire . '",
               "conditions": [
                  {"bucket": "' . $bucket_name . '"},
                  ["starts-with", "$key", ""],
                  {"acl": "public-read"},
                  ["content-length-range", 0, 100485760],
                  ["starts-with", "$Content-Type", ""]
              ]
          }';

          $policy = base64_encode($policy_document);
          $hash = $this->hmacsha1($aws_secret_key, $policy);
          $signature = $this->hex2b64($hash);
          $token = array('policy' => $policy,
                         'signature' => $signature,
                         'key' => $aws_access_key_id);
          return json_encode($token);
      }
      private function hmacsha1($key, $data) {
          $blocksize = 64;
          $hashfunc = 'sha1';
          if(strlen($key) > $blocksize)
              $key = pack('H*', $hashfunc($key));
          $key = str_pad($key, $blocksize, chr(0x00));
          $ipad = str_repeat(chr(0x36), $blocksize);
          $opad = str_repeat(chr(0x5c), $blocksize);
          $hmac = pack('H*', $hashfunc(($key ^ $opad).pack('H*', $hashfunc(($key ^ $ipad).$data))));
          return bin2hex($hmac);
      }

      private function hex2b64($str) {
          $raw = '';
          for($i=0; $i < strlen($str); $i+=2) {
              $raw .= chr(hexdec(substr($str, $i, 2)));
          }
          return base64_encode($raw);
      }
  ///////////////////////////////map///////////////////////////////////////
      public function getRleatedGroup($businessgroup){
          if($businessgroup =='golfcourse'){
            $golfcourses = Golfcourse::all();
            foreach($golfcourses as $golfcourse){
              $ids = $golfcourse->id;
              if(Relation::find($ids) == null)
                continue;
              $relations[] = Relation::find($ids);
            }
            return $relations;
          }
          else{
            return $businessgroup;
          }
      }
}
