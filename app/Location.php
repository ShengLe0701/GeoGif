<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
  protected $hidden = [ 'created_at', 'updated_at' ];
  protected $fillable = [ 'name', 'iswholeworld', 'location', ];
}
