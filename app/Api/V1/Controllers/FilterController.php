<?php

namespace App\Api\V1\Controllers;

//use Illuminate\Http\Request;
//use App\Http\Requests;

use JWTAuth;
use Validator;
use Config;
use App\User;
use App\Filter;
use App\Location;
use Illuminate\Http\Request;
use Illuminate\Mail\Message;
use Dingo\Api\Routing\Helpers;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Password;
use Tymon\JWTAuth\Exceptions\JWTException;
use Dingo\Api\Exception\ValidationHttpException;

class FilterController extends Controller
{
    use Helpers;

    public function pointInPolygon($polySides,$polyX,$polyY,$x,$y)
    {
        $j = $polySides-1 ;
        $oddNodes = 0;
        for ($i = 0; $i < $polySides; $i++ )
        {
            if ($polyY[$i]<$y && $polyY[$j]>=$y || $polyY[$j]<$y && $polyY[$i]>=$y)
            {
                if ($polyX[$i]+($y-$polyY[$i])/($polyY[$j]-$polyY[$i])*($polyX[$j]-$polyX[$i])<$x)
                {
                    $oddNodes=!$oddNodes;
                }
            }

            $j = $i;
        }

        return $oddNodes;
    }

    public function getfilter(Request $request)
    {
        if($filters = Filter::all())
        {
            $filter_datas = null;

            foreach ($filters as $filter) {
                $location = Location::where('id', '=', $filter->locationid)->firstOrFail();

                $filter_data = $filter;
                array_add($filter_data, 'location_name', $location->name);
                array_add($filter_data, 'location_iswholeworld', $location->iswholeworld);
                array_add($filter_data, 'location_area', $location->location);;
                $filter_datas[] = $filter_data;
            }

//            return $filter;
            return $filter_datas;
        }
        else
            return $this->response->error('could not get public filters', 500);
    }

    public function getpublicfilter(Request $request)
    {
        if($filters = Filter::all())
        {
            $filter_datas = null;

            foreach ($filters as $filter) {
                $location = Location::where('id', '=', $filter->locationid)->firstOrFail();

                if( $location->iswholeworld == '1' )
                {
                    $filter_data = ['id'=>$filter->id, 'url'=>$filter->url];

                    // $filter_data = $filter;
                    // array_add($filter_data, 'location_name', $location->name);
                    // array_add($filter_data, 'location_iswholeworld', $location->iswholeworld);
                    // array_add($filter_data, 'location_area', $location->location);;

                    $filter_datas[] = $filter_data;
                }
            }

//            return $filter;
            return $filter_datas;
        }
        else
            return $this->response->error('could not get public filters', 500);
    }

    public function getprviatefilter(Request $request)
    {
      $rules = array(
        'location_lat' => 'required',
        'location_lon' => 'required',
      );
      $validator = Validator::make($request->all(), $rules);

      if ($validator->fails()) {
          throw new ValidationHttpException($validator->errors()->all());
      }

      if($filters = Filter::all())
      {
          $filter_datas = null;

          foreach ($filters as $filter) {
              $location = Location::where('id', '=', $filter->locationid)->firstOrFail();

              if( $location->iswholeworld == '0' )
              {
                  $Polygon = json_decode($location->location, true);

                  $PlygonLat = array_column($Polygon, "lat");
                  $PlygonLon = array_column($Polygon, "lng");
                  $lat = $request->input("location_lat");
                  $lon = $request->input("location_lon");

                  // return $PlygonLat;

                  if($this->pointInPolygon( count($PlygonLat), $PlygonLat, $PlygonLon, $lat, $lon) )
                  {
                      // $filter_data = $filter;
                      // array_add($filter_data, 'location_name', $location->name);
                      // array_add($filter_data, 'location_iswholeworld', $location->iswholeworld);
                      // array_add($filter_data, 'location_area', $location->location);;
                      $filter_data = ['id'=>$filter->id, 'url'=>$filter->url];

                      // array_add($filter_data, 'id', $filter->id);
                      // array_add($filter_data, 'url', $filter->url);

                      $filter_datas[] = $filter_data;
                  }
              }
          }

          return $filter_datas;
      }
      else
          return $this->response->error('could not get public filters', 500);
    }

    public function getfilterwithid(Request $request)
    {
        $rules = array(
            'id' => 'required',
        );
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            throw new ValidationHttpException($validator->errors()->all());
        }
        else {
            $filter = Filter::find($request->input('id'));
            if( !$filter )
                return $this->response->noContent();

            $location = Location::where('id', '=', $filter->locationid)->firstOrFail();
            if( !$location )
                return $this->response->error('could_not_find_location', 500);

            $filter_data = $filter;
            array_add($filter_data, 'location_name', $location->name);
            array_add($filter_data, 'location_iswholeworld', $location->iswholeworld);
            array_add($filter_data, 'location_area', $location->location);;
            $filter_datas[] = $filter_data;

            return $filter_datas;
        }

    }

    public function getfilterwithname(Request $request)
    {
        $rules = array(
            'name' => 'required',
        );
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            throw new ValidationHttpException($validator->errors()->all());
        }
        else {
            $filter_datas = null;

            $filters = Filter::where('name', '=', $request->input('name'))->get();
            if( !$filters )
                return $this->response->noContent();
            foreach ($filters as $filter) {
                $location = Location::where('id', '=', $filter->locationid)->firstOrFail();
                if( !$location )
                    return $this->response->error('could_not_find_location', 500);

                $filter_data = $filter;
                array_add($filter_data, 'location_name', $location->name);
                array_add($filter_data, 'location_iswholeworld', $location->iswholeworld);
                array_add($filter_data, 'location_area', $location->location);;
                $filter_datas[] = $filter_data;
            }

            return $filter_datas;
        }

    }

    public function getfilterwithlocation(Request $request)
    {
        $rules = array(
            'location' => 'required',
        );
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            throw new ValidationHttpException($validator->errors()->all());
        }
        else {
          if($filters = Filter::all())
          {
              $filter_datas = null;
              foreach ($filters as $filter) {

                  $location = Location::where('id', '=', $filter->locationid)->firstOrFail();
                  if( !$location )
                      return $this->response->error('could_not_find_location', 500);

//                  return strpos( $location->name, $request->input('location') );
                  if( strpos( $location->name, $request->input('location') ) !== false )
                  {
                      $filter_data = $filter;
                      array_add($filter_data, 'location_name', $location->name);
                      array_add($filter_data, 'location_iswholeworld', $location->iswholeworld);
                      array_add($filter_data, 'location_area', $location->location);;
                      $filter_datas[] = $filter_data;
                  }
              }

              return $filter_datas;
            }

            return $this->response->noContent();
        }

    }

    public function addfilter(Request $request)
    {
      $rules = array(
          'name'           => 'required',
          'url'           => 'required',
          'start_date'    => 'required',
          'start_time'        => 'required',
          'end_date'         => 'required',
          'end_time'           => 'required',
          'location_name'         => 'required',
          'location_iswholeworld' => 'required',
          'location_area'       => 'required',
//          'like'      => 'required',
      );

      $validator = Validator::make($request->all(), $rules);

      if ($validator->fails()) {
          throw new ValidationHttpException($validator->errors()->all());
      }
      else
      {
          $location = new Location;
          $location->name       = $request->input('location_name');
          $location->iswholeworld = $request->input('location_iswholeworld');
          $location->location     = $request->input('location_area');

          $ret = $location->save();
          if($ret != 1)
              return $this->response->error('could_not_add_location', 500);

          $filter = new Filter;
          $filter->name       = $request->input('name');
          $filter->url       = $request->input('url');
          $filter->start_date = $request->input('start_date');
          $filter->start_time = $request->input('start_time');
          $filter->end_date   = $request->input('end_date');
          $filter->end_time   = $request->input('end_time');
          $filter->like        = 0;
          $filter->locationid      = $location->id;

          $ret = $filter->save();
          if($ret != 1)
              return $this->response->error('could_not_add_filter', 500);
        }

        return $this->response->noContent();
    }

    public function removefilter(Request $request)
    {
      $rules = array(
          'id' => 'required',
      );
      $validator = Validator::make($request->all(), $rules);

      if ($validator->fails()) {
          throw new ValidationHttpException($validator->errors()->all());
      }
      else {
          $filter = Filter::where('id', '=', $request->input('id'))->firstOrFail();
          if( !$filter)
              return $this->response->error('could_not_get_filter', 500);

          $location = Location::where('id', '=', $filter->locationid)->firstOrFail();
          if( !$location)
              return $this->response->error('could_not_get_location', 500);

          if(!$location->delete())
              return $this->response->error('could_not_delete_location', 500);

          if(!$filter->delete())
              return $this->response->error('could_not_delete_filter', 500);
        }

        return $this->response->noContent();
    }

    public function updatefilter(Request $request)
    {
        $rules = array(
            'id' => 'required',
        );
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            throw new ValidationHttpException($validator->errors()->all());
        }
        else
        {
            $filter = Filter::find($request->input('id'));

            if( $request->input('name') )
                $filter->name       = $request->input('name');
            if( $request->input('url') )
                $filter->url       = $request->input('url');
            if( $request->input('start_date') )
                $filter->start_date = $request->input('start_date');
            if( $request->input('start_time') )
                $filter->start_time = $request->input('start_time');
            if( $request->input('end_date') )
                $filter->end_date   = $request->input('end_date');
            if( $request->input('end_time') )
                $filter->end_time   = $request->input('end_time');
            if( $request->input('like') )
                $filter->like        = $request->input('like');

            $ret = $filter->save();
            if($ret != 1)
                return $this->response->error('could_not_update_filter', 500);

            $location = Location::where('id', '=', $filter->locationid)->firstOrFail();

            if( $request->input('location_name') )
                $location->name       = $request->input('location_name');
            if( $request->input('location_iswholeworld') )
                $location->iswholeworld = $request->input('location_iswholeworld');
            if( $request->input('location_area') )
                $location->location     = $request->input('location_area');

            $ret = $location->save();
            if($ret != 1)
                return $this->response->error('could_not_update_location', 500);

          }

          return $this->getpublicfilter($request);
      }



}
