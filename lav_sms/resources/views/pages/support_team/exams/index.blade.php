@extends('layouts.master')
@section('page_title', 'Manage Exams')
@section('content')

    <div class="card">
        <div class="card-header header-elements-inline d-flex align-items-center justify-content-between">
            <h6 class="card-title"><i class="icon-books2 mr-2"></i> Manage Exams</h6>

            @if(Qs::userIsTeamSA())
                <button type="button" class="btn btn-primary btn-sm d-flex align-items-center" data-toggle="modal" data-target="#createExamModal" style="border-radius: 8px;">
                    <i class="icon-plus-circle2 mr-2"></i> Add Exam
                </button>
            @endif
        </div>

        <div class="card-body">
            <table class="table datatable-button-html5-columns">
                <thead>
                <tr>
                    <th>S/N</th>
                    <th>Name</th>
                    <th>Term</th>
                    <th>Session</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                @foreach($exams as $ex)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $ex->name }}</td>
                        <td>{{ 'Term '.$ex->term }}</td>
                        <td>{{ $ex->year }}</td>
                        <td class="text-center">
                            <div class="list-icons">
                                <div class="dropdown">
                                    <a href="#" class="list-icons-item" data-toggle="dropdown">
                                        <i class="icon-menu9"></i>
                                    </a>

                                    <div class="dropdown-menu dropdown-menu-left">
                                        @if(Qs::userIsTeamSA())
                                            {{--Edit--}}
                                            <a href="{{ route('exams.edit', $ex->id) }}" class="dropdown-item"><i class="icon-pencil"></i> Edit</a>
                                        @endif
                                        @if(Qs::userIsSuperAdmin())
                                            {{--Delete--}}
                                            <a id="{{ $ex->id }}" onclick="confirmDelete(this.id)" href="#" class="dropdown-item"><i class="icon-trash"></i> Delete</a>
                                            <form method="post" id="item-delete-{{ $ex->id }}" action="{{ route('exams.destroy', $ex->id) }}" class="hidden">@csrf @method('delete')</form>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>

    @if(Qs::userIsTeamSA())
        <!-- CREATE EXAM MODAL -->
        <div id="createExamModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="createExamModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content" style="border-radius: 16px; overflow: hidden; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
                    <div class="modal-header bg-primary text-white" style="padding: 1.2rem 1.5rem;">
                        <h5 class="modal-title" id="createExamModalLabel" style="font-weight: 700; color: #ffffff !important;"><i class="icon-books2 mr-2"></i> Add Exam</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" style="opacity: 0.8; font-size: 1.5rem;">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form method="post" action="{{ route('exams.store') }}">
                        @csrf
                        <div class="modal-body" style="padding: 1.5rem;">

                            <div class="alert alert-info border-0 alert-dismissible mb-3" style="border-radius: 8px;">
                                <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
                                <span>You are creating an Exam for the Current Session <strong>{{ Qs::getSetting('current_session') }}</strong></span>
                            </div>

                            <div class="form-group">
                                <label class="font-weight-semibold">Name <span class="text-danger">*</span></label>
                                <input name="name" value="{{ old('name') }}" required type="text" class="form-control" placeholder="Name of Exam">
                            </div>

                            <div class="form-group">
                                <label for="modal_term" class="font-weight-semibold">Term</label>
                                <select class="form-control select" name="term" id="modal_term">
                                    <option {{ old('term') == 1 ? 'selected' : '' }} value="1">First Term</option>
                                    <option {{ old('term') == 2 ? 'selected' : '' }} value="2">Second Term</option>
                                    <option {{ old('term') == 3 ? 'selected' : '' }} value="3">Third Term</option>
                                </select>
                            </div>

                        </div>
                        <div class="modal-footer" style="background-color: #f8fafc; border-top: 1px solid rgba(0,0,0,0.05); padding: 1rem 1.5rem;">
                            <button type="button" class="btn btn-light" data-dismiss="modal" style="border-radius: 8px;">Cancel</button>
                            <button id="ajax-btn" type="submit" class="btn btn-primary">Submit <i class="icon-paperplane ml-2"></i></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endif

@endsection
