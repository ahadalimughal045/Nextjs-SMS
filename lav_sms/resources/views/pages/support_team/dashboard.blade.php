@extends('layouts.master')
@section('page_title', 'My Dashboard')
@section('content')

    @if(Qs::userIsTeamSA())
       <div class="row">

           {{-- Total Students --}}
           <div class="col-sm-6 col-xl-3">
               <div class="card card-body stat-card stat-blue">
                   <div class="media align-items-center">
                       <div class="media-body">
                           <h3 class="mb-1">{{ $users->where('user_type', 'student')->count() }}</h3>
                           <span style="font-size:0.72rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; opacity:0.85;">Total Students</span>
                       </div>
                       <div class="stat-icon ml-3">
                           <i class="icon-users4"></i>
                       </div>
                   </div>
               </div>
           </div>

           {{-- Total Teachers --}}
           <div class="col-sm-6 col-xl-3">
               <div class="card card-body stat-card stat-red">
                   <div class="media align-items-center">
                       <div class="media-body">
                           <h3 class="mb-1">{{ $users->where('user_type', 'teacher')->count() }}</h3>
                           <span style="font-size:0.72rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; opacity:0.85;">Total Teachers</span>
                       </div>
                       <div class="stat-icon ml-3">
                           <i class="icon-chalkboard"></i>
                       </div>
                   </div>
               </div>
           </div>

           {{-- Total Administrators --}}
           <div class="col-sm-6 col-xl-3">
               <div class="card card-body stat-card stat-green">
                   <div class="media align-items-center">
                       <div class="media-body">
                           <h3 class="mb-1">{{ $users->where('user_type', 'admin')->count() }}</h3>
                           <span style="font-size:0.72rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; opacity:0.85;">Total Admins</span>
                       </div>
                       <div class="stat-icon ml-3">
                           <i class="icon-office"></i>
                       </div>
                   </div>
               </div>
           </div>

           {{-- Total Parents --}}
           <div class="col-sm-6 col-xl-3">
               <div class="card card-body stat-card stat-purple">
                   <div class="media align-items-center">
                       <div class="media-body">
                           <h3 class="mb-1">{{ $users->where('user_type', 'parent')->count() }}</h3>
                           <span style="font-size:0.72rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; opacity:0.85;">Total Parents</span>
                       </div>
                       <div class="stat-icon ml-3">
                           <i class="icon-users"></i>
                       </div>
                   </div>
               </div>
           </div>

       </div>
    @endif

    {{--Events Calendar Begins--}}
    <div class="card">
        <div class="card-header header-elements-inline d-flex align-items-center justify-content-between">
            <h5 class="card-title mb-0"><i class="icon-calendar3 mr-2 text-primary"></i> School Events Calendar</h5>
            {!! Qs::getPanelOptions() !!}
        </div>

        <div class="card-body">
            <div class="fullcalendar-basic"></div>
        </div>
    </div>
    {{--Events Calendar Ends--}}

@endsection
