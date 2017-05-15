<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Filter extends Model
{
    protected $hidden = ['created_at', 'updated_at'];
    protected $fillable = [ 'name', 'url', 'start_date', 'start_time', 'end_date',
      'end_time', 'like', 'locationid', ];
}
