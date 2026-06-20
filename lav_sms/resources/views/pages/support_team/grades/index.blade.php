@extends('layouts.master')
@section('page_title', 'Manage Grades')
@section('content')

    <div class="card">
        <div class="card-header header-elements-inline d-flex align-items-center justify-content-between">
            <h6 class="card-title"><i class="icon-medal2 mr-2"></i> Manage Grades</h6>

            @if(Qs::userIsTeamSA())
                <button type="button" class="btn btn-primary btn-sm d-flex align-items-center" data-toggle="modal" data-target="#createGradeModal" style="border-radius: 8px;">
                    <i class="icon-plus-circle2 mr-2"></i> Add Grade
                </button>
            @endif
        </div>

        <div class="card-body">
            <table class="table datatable-button-html5-columns">
                <thead>
                <tr>
                    <th>S/N</th>
                    <th>Name</th>
                    <th>Grade Type</th>
                    <th>Range</th>
                    <th>Remark</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                @foreach($grades as $gr)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $gr->name }}</td>
                        <td>{{ $gr->class_type_id ? $class_types->where('id', $gr->class_type_id)->first()->name : ''}}</td>
                        <td>{{ $gr->mark_from.' - '.$gr->mark_to }}</td>
                        <td>{{ $gr->remark }}</td>
                        <td class="text-center">
                            <div class="list-icons">
                                <div class="dropdown">
                                    <a href="#" class="list-icons-item" data-toggle="dropdown">
                                        <i class="icon-menu9"></i>
                                    </a>

                                    <div class="dropdown-menu dropdown-menu-left">
                                        @if(Qs::userIsTeamSA())
                                            {{--Edit--}}
                                            <a href="{{ route('grades.edit', $gr->id) }}" class="dropdown-item"><i class="icon-pencil"></i> Edit</a>
                                        @endif
                                        @if(Qs::userIsSuperAdmin())
                                            {{--Delete--}}
                                            <a id="{{ $gr->id }}" onclick="confirmDelete(this.id)" href="#" class="dropdown-item"><i class="icon-trash"></i> Delete</a>
                                            <form method="post" id="item-delete-{{ $gr->id }}" action="{{ route('grades.destroy', $gr->id) }}" class="hidden">@csrf @method('delete')</form>
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
        <!-- CREATE GRADE MODAL -->
        <div id="createGradeModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="createGradeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content" style="border-radius: 16px; overflow: hidden; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
                    <div class="modal-header bg-primary text-white" style="padding: 1.2rem 1.5rem;">
                        <h5 class="modal-title" id="createGradeModalLabel" style="font-weight: 700; color: #ffffff !important;"><i class="icon-medal2 mr-2"></i> Add Grade</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" style="opacity: 0.8; font-size: 1.5rem;">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form method="post" action="{{ route('grades.store') }}">
                        @csrf
                        <div class="modal-body" style="padding: 1.5rem;">

                            <div class="alert alert-info border-0 alert-dismissible mb-3" style="border-radius: 8px;">
                                <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
                                <span>If this grade applies to all class types, select <strong>NOT APPLICABLE</strong>. Otherwise select the specific Class Type.</span>
                            </div>

                            <div class="form-group">
                                <label class="font-weight-semibold">Name <span class="text-danger">*</span></label>
                                <input name="name" value="{{ old('name') }}" required type="text" class="form-control text-uppercase" placeholder="E.g. A1">
                            </div>

                            <div class="form-group">
                                <label for="modal_class_type_id" class="font-weight-semibold">Grade Type</label>
                                <select class="form-control select" name="class_type_id" id="modal_class_type_id">
                                    <option value="">Not Applicable</option>
                                    @foreach($class_types as $ct)
                                        <option {{ old('class_type_id') == $ct->id ? 'selected' : '' }} value="{{ $ct->id }}">{{ $ct->name }}</option>
                                    @endforeach
                                </select>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="font-weight-semibold">Mark From <span class="text-danger">*</span></label>
                                        <input min="0" max="100" name="mark_from" value="{{ old('mark_from') }}" required type="number" class="form-control" placeholder="0">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="font-weight-semibold">Mark To <span class="text-danger">*</span></label>
                                        <input min="0" max="100" name="mark_to" value="{{ old('mark_to') }}" required type="number" class="form-control" placeholder="0">
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="modal_remark" class="font-weight-semibold">Remark</label>
                                <select class="form-control select" name="remark" id="modal_remark">
                                    <option value="">Select Remark...</option>
                                    @foreach(Mk::getRemarks() as $rem)
                                        <option {{ old('remark') == $rem ? 'selected' : '' }} value="{{ $rem }}">{{ $rem }}</option>
                                    @endforeach
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
