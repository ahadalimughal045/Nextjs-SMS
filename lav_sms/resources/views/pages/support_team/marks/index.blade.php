@extends('layouts.master')
@section('page_title', 'Manage Exam Marks')
@section('content')
    <div class="card">
        <div class="card-header header-elements-inline d-flex align-items-center justify-content-between">
            <h6 class="card-title"><i class="icon-books mr-2"></i> Manage Exam Marks</h6>
        </div>

        <div class="card-body">
            @include('pages.support_team.marks.selector')
        </div>
    </div>
    @endsection
