@extends('layouts.master')
@section('page_title', 'Payments')
@section('content')

    <div class="d-flex justify-content-between align-items-center mb-3">
        <!-- Unified Navigation Tabs -->
        <ul class="nav nav-pills nav-pills-bordered" style="gap: 8px;">
            <li class="nav-item">
                <a href="#manage-payments-tab" class="nav-link {{ $tab == 'manage' ? 'active' : '' }}" data-toggle="tab" style="border-radius: 8px; font-weight: 600; padding: 0.6rem 1.2rem;">
                    <i class="icon-cash2 mr-2"></i> Manage Payments
                </a>
            </li>
            <li class="nav-item">
                <a href="#student-payments-tab" class="nav-link {{ $tab == 'students' ? 'active' : '' }}" data-toggle="tab" style="border-radius: 8px; font-weight: 600; padding: 0.6rem 1.2rem;">
                    <i class="icon-users mr-2"></i> Student Payments
                </a>
            </li>
        </ul>

        <!-- Create Payment Button -->
        <button type="button" class="btn btn-primary d-flex align-items-center" data-toggle="modal" data-target="#createPaymentModal" style="border-radius: 8px; padding: 0.6rem 1.2rem;">
            <i class="icon-plus-circle2 mr-2"></i> Create Payment
        </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">

        <!-- TAB 1: MANAGE PAYMENTS -->
        <div class="tab-pane fade {{ $tab == 'manage' ? 'show active' : '' }}" id="manage-payments-tab">
            <!-- Year Selector Card -->
            <div class="card">
                <div class="card-header header-elements-inline d-flex align-items-center justify-content-between py-2">
                    <h5 class="card-title mb-0"><i class="icon-calendar3 mr-2"></i> Select Session Year</h5>
                    
                    <div class="header-elements m-0">
                        <form method="post" action="{{ route('payments.select_year') }}" class="form-inline">
                            @csrf
                            <div class="form-group mb-0 mr-2">
                                <select data-placeholder="Select Year" required id="year" name="year" class="form-control select" style="min-width: 180px;">
                                    @foreach($years as $yr)
                                        <option {{ ($selected && $year == $yr->year) ? 'selected' : '' }} value="{{ $yr->year }}">{{ $yr->year }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary btn-sm" style="height: 36px; padding: 0 16px; border-radius: 8px;">Submit <i class="icon-paperplane ml-1"></i></button>
                        </form>
                    </div>
                </div>
            </div>

            @if($selected)
                <!-- Payments List Card -->
                <div class="card">
                    <div class="card-header header-elements-inline">
                        <h6 class="card-title">Manage Payments for {{ $year }} Session</h6>
                        {!! Qs::getPanelOptions() !!}
                    </div>

                    <div class="card-body">
                        <ul class="nav nav-tabs nav-tabs-highlight">
                            <li class="nav-item"><a href="#all-payments" class="nav-link active" data-toggle="tab">All Classes</a></li>
                            <li class="nav-item dropdown">
                                <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown">Class Payments</a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    @foreach($my_classes as $mc)
                                        <a href="#pc-{{ $mc->id }}" class="dropdown-item" data-toggle="tab">{{ $mc->name }}</a>
                                    @endforeach
                                </div>
                            </li>
                        </ul>

                        <div class="tab-content">
                            <div class="tab-pane fade show active" id="all-payments">
                                <table class="table datatable-button-html5-columns">
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Amount</th>
                                        <th>Ref_No</th>
                                        <th>Class</th>
                                        <th>Method</th>
                                        <th>Info</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    @foreach($payments as $p)
                                        <tr>
                                            <td>{{ $loop->iteration }}</td>
                                            <td>{{ $p->title }}</td>
                                            <td>{{ $p->amount }}</td>
                                            <td>{{ $p->ref_no }}</td>
                                            <td>{{ $p->my_class_id ? $p->my_class->name : '' }}</td>
                                            <td>{{ ucwords($p->method) }}</td>
                                            <td>{{ $p->description }}</td>
                                            <td class="text-center">
                                                <div class="list-icons">
                                                    <div class="dropdown">
                                                        <a href="#" class="list-icons-item" data-toggle="dropdown">
                                                            <i class="icon-menu9"></i>
                                                        </a>

                                                        <div class="dropdown-menu dropdown-menu-left">
                                                            <a href="{{ route('payments.edit', $p->id) }}" class="dropdown-item"><i class="icon-pencil"></i> Edit</a>
                                                            <a id="{{ $p->id }}" onclick="confirmDelete(this.id)" href="#" class="dropdown-item"><i class="icon-trash"></i> Delete</a>
                                                            <form method="post" id="item-delete-{{ $p->id }}" action="{{ route('payments.destroy', $p->id) }}" class="hidden">@csrf @method('delete')</form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                    </tbody>
                                </table>
                            </div>

                            @foreach($my_classes as $mc)
                                <div class="tab-pane fade" id="pc-{{ $mc->id }}">
                                    <table class="table datatable-button-html5-columns">
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Title</th>
                                            <th>Amount</th>
                                            <th>Ref_No</th>
                                            <th>Class</th>
                                            <th>Method</th>
                                            <th>Info</th>
                                            <th>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        @foreach($payments->where('my_class_id', $mc->id) as $p)
                                            <tr>
                                                <td>{{ $loop->iteration }}</td>
                                                <td>{{ $p->title }}</td>
                                                <td>{{ $p->amount }}</td>
                                                <td>{{ $p->ref_no }}</td>
                                                <td>{{ $p->my_class_id ? $p->my_class->name : '' }}</td>
                                                <td>{{ ucwords($p->method) }}</td>
                                                <td>{{ $p->description }}</td>
                                                <td class="text-center">
                                                    <div class="list-icons">
                                                        <div class="dropdown">
                                                            <a href="#" class="list-icons-item" data-toggle="dropdown">
                                                                <i class="icon-menu9"></i>
                                                            </a>

                                                            <div class="dropdown-menu dropdown-menu-left">
                                                                <a href="{{ route('payments.edit', $p->id) }}" class="dropdown-item"><i class="icon-pencil"></i> Edit</a>
                                                                <a id="{{ $p->id }}" onclick="confirmDelete(this.id)" href="#" class="dropdown-item"><i class="icon-trash"></i> Delete</a>
                                                                <form method="post" id="item-delete-{{ $p->id }}" action="{{ route('payments.destroy', $p->id) }}" class="hidden">@csrf @method('delete')</form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            @endif
        </div>

        <!-- TAB 2: STUDENT PAYMENTS -->
        <div class="tab-pane fade {{ $tab == 'students' ? 'show active' : '' }}" id="student-payments-tab">
            <!-- Student Payments Selection Card -->
            <div class="card">
                <div class="card-header header-elements-inline d-flex align-items-center justify-content-between py-2">
                    <h5 class="card-title mb-0"><i class="icon-users4 mr-2"></i> Select Class for Student Payments</h5>
                    
                    <div class="header-elements m-0">
                        <form method="post" action="{{ route('payments.select_class') }}" class="form-inline">
                            @csrf
                            <div class="form-group mb-0 mr-2">
                                <select required id="my_class_id" name="my_class_id" class="form-control select" style="min-width: 180px;">
                                    <option value="">Select Class</option>
                                    @foreach($my_classes as $c)
                                        <option {{ (isset($my_class_id) && $my_class_id == $c->id) ? 'selected' : '' }} value="{{ $c->id }}">{{ $c->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary btn-sm" style="height: 36px; padding: 0 16px; border-radius: 8px;">Submit <i class="icon-paperplane ml-1"></i></button>
                        </form>
                    </div>
                </div>
            </div>

            @if(isset($students_selected) && $students_selected)
                <!-- Student Table Card -->
                <div class="card">
                    <div class="card-body">
                        <table class="table datatable-button-html5-columns">
                            <thead>
                            <tr>
                                <th>S/N</th>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>ADM_No</th>
                                <th>Payments</th>
                            </tr>
                            </thead>
                            <tbody>
                            @foreach($students as $s)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>
                                        <img class="rounded-circle" style="height: 40px; width: 40px;" src="{{ $s->user->photo }}" onerror="this.src='{{ asset('global_assets/images/tab_bar.png') }}'" alt="photo">
                                    </td>
                                    <td>{{ $s->user->name }}</td>
                                    <td>{{ $s->adm_no }}</td>
                                    <td>
                                        <div class="dropdown">
                                            <a href="#" class="btn btn-danger" data-toggle="dropdown">
                                                Manage Payments <i class="icon-arrow-down5"></i>
                                            </a>
                                            <div class="dropdown-menu dropdown-menu-left">
                                                <a href="{{ route('payments.invoice', [Qs::hash($s->user_id)]) }}" class="dropdown-item">All Payments</a>
                                                @foreach(Pay::getYears($s->user_id) as $py)
                                                    @if($py)
                                                        <a href="{{ route('payments.invoice', [Qs::hash($s->user_id), $py]) }}" class="dropdown-item">{{ $py }}</a>
                                                    @endif
                                                @endforeach
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <!-- CREATE PAYMENT MODAL -->
    <div id="createPaymentModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="createPaymentModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content" style="border-radius: 16px; overflow: hidden; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
                <div class="modal-header bg-primary text-white" style="padding: 1.2rem 1.5rem;">
                    <h5 class="modal-title" id="createPaymentModalLabel" style="font-weight: 700; color: #ffffff !important;"><i class="icon-plus-circle2 mr-2"></i> Create Payment</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" style="opacity: 0.8; font-size: 1.5rem;">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form class="ajax-store" method="post" action="{{ route('payments.store') }}">
                    @csrf
                    <div class="modal-body" style="padding: 1.5rem;">
                        <div class="form-group">
                            <label class="font-weight-semibold">Title <span class="text-danger">*</span></label>
                            <input name="title" value="{{ old('title') }}" required type="text" class="form-control" placeholder="Eg. School Fees">
                        </div>

                        <div class="form-group">
                            <label for="modal_my_class_id" class="font-weight-semibold">Class</label>
                            <select class="form-control select-search" name="my_class_id" id="modal_my_class_id">
                                <option value="">All Classes</option>
                                @foreach($my_classes as $c)
                                    <option {{ old('my_class_id') == $c->id ? 'selected' : '' }} value="{{ $c->id }}">{{ $c->name }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="modal_method" class="font-weight-semibold">Payment Method</label>
                            <select class="form-control select" name="method" id="modal_method">
                                <option selected value="Cash">Cash</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="modal_amount" class="font-weight-semibold">Amount (<del style="text-decoration-style: double">N</del>) <span class="text-danger">*</span></label>
                            <input class="form-control" value="{{ old('amount') }}" required name="amount" id="modal_amount" type="number">
                        </div>

                        <div class="form-group">
                            <label for="modal_description" class="font-weight-semibold">Description</label>
                            <input class="form-control" value="{{ old('description') }}" name="description" id="modal_description" type="text" placeholder="Eg. First Term Fees">
                        </div>
                    </div>
                    <div class="modal-footer" style="background-color: #f8fafc; border-top: 1px solid rgba(0,0,0,0.05); padding: 1rem 1.5rem;">
                        <button type="button" class="btn btn-light" data-dismiss="modal" style="border-radius: 8px;">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit <i class="icon-paperplane ml-2"></i></button>
                    </div>
                </form>
            </div>
        </div>
    </div>

@endsection
